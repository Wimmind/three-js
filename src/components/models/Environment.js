import * as THREE from "three";
//import textures from "../../data";
import TWEEN from "@tweenjs/tween.js";

import Sphere from "./Sphere";
import Arrows from "./Arrows";
import Location from "./Location";

import * as helpers from "../../helperFunctions";
export default class Environment {
  constructor(reactComponent, textures) {
    this.textures = textures;
    this.reactComponent = reactComponent;
    this.locations = [];
  }

  lon = 0;
  lat = 0;
  phi = 0;
  theta = 0;

  isSphereAnimation = false;

  init = async () => {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    this.camera.target = new THREE.Vector3(0, 0, 0);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector(".canvas").appendChild(this.renderer.domElement);
    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.initEvents();

    this.currentLocation = new Location(this.textures[0], this.reactComponent);
    const { id, coords, siblings, src } = this.currentLocation;
    this.reactComponent.updateId(id);

    await this.currentLocation.loadTexture();
    
    console.log('2')
    this.mainSphere = new Sphere("main", {
      map: this.currentLocation.texture,
      transparent: true,
      opacity: 1
    });

    this.otherSphere = new Sphere("other", {
      transparent: true,
      opacity: 0
    });

    this.otherSphere.changePosition(0, -10000, 0);
    this.createArrows(siblings, coords)
    this.scene.add(this.mainSphere.mesh, this.otherSphere.mesh);
  };


  initEvents = () => {
    const windowEvents = [
      { action: "mousedown", evt: this.onPointerStart },
      { action: "mousemove", evt: this.onPointerMove },
      { action: "mouseup", evt: this.onCursorUp },
      { action: "resize", evt: this.onWindowResize },
    ];
    windowEvents.forEach(({ action, evt }) => {
      document.addEventListener(action, evt);
    });
  };

  onPointerStart = (event) => {
    if (!this.isSphereAnimation) {
      const clientX = event.clientX || event.touches[0].clientX;
      const clientY = event.clientY || event.touches[0].clientY;
      this.mouseDownMouseX = clientX;
      this.mouseDownMouseY = clientY;
      this.mouseDownLon = this.lon;
      this.mouseDownLat = this.lat;
    }
  };

  onPointerMove = (event) => {
    if (!this.isSphereAnimation) {
      if (!this.mouseDownMouseX) return;
      const clientX = event.clientX;
      const clientY = event.clientY;
      this.lon = ((this.mouseDownMouseX - clientX) * this.camera.fov) / 600 + this.mouseDownLon;
      this.lat = ((clientY - this.mouseDownMouseY) * this.camera.fov) / 600 + this.mouseDownLat;
    }
  };

  onCursorUp = (event) => {
    if (!this.isSphereAnimation) {
      this.mouseDownMouseX = null;

      const intersects = this.getIntersects(event.layerX, event.layerY);

      if (intersects.length > 0) {
        const res = intersects.filter(res => { return res && res.object; })[0];

        if (res && res.object) {

          const siblingTexture = this.textures.filter(({ id }) => id === res.object.name)[0]; // сиблинг по которому кликнули
          const currentTexture = this.currentLocation; // текущая текстура
          // единичный вектор
          const unit_vec = helpers.getUnicVector(
            currentTexture.coords,
            siblingTexture.coords
          );
          // создать other сферу и расположить ее на 10ед дальше по прямой
          const coefficient = 8;
          const newCoords = {
            x: unit_vec.x * coefficient,
            y: unit_vec.y * coefficient,
            z: unit_vec.z * coefficient,
          };

          // вырубить все управление
          this.isSphereAnimation = true;
          // поворот камеры
          this.camera.lookAt(newCoords.x, 0, newCoords.z);

          this.currentLocation.loadSiblingsTexture(`/textures/${siblingTexture.src}`, () => {
            this.otherSphere.setTexture(this.currentLocation.siblingTexture);
            this.otherSphere.changePosition(newCoords.x, newCoords.y, newCoords.z);

            const temp = { ...newCoords, opacity: 1, opacity2: 0 };
            let tween = new TWEEN.Tween(temp)
              .to({ x: 0, y: 0, z: 0, opacity: 0, opacity2: 1 }, 3000)
              .onUpdate(() => {
                this.otherSphere.changePosition(temp.x, temp.y, temp.z);
                this.mainSphere.changeOpacity(temp.opacity)
                this.otherSphere.changeOpacity(temp.opacity2)
              })
              .start()
              .onComplete(() => {
                this.mainSphere.changeOpacity(1);
                this.otherSphere.changeOpacity(0);
                this.otherSphere.changePosition(0, -10000, 0);

                this.isSphereAnimation = false;
                this.switchEnvironment(siblingTexture, false);
              });
          })

        }
      }
    }
  };

  onWindowResize = () => {
    if (!this.isSphereAnimation) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  createArrows = (siblings, coords) => {
    const arrows = new Arrows("arrowGroup");
    arrows.init(siblings, coords);
    this.arrowGroup = arrows;
    this.scene.add(this.arrowGroup.arrowGroup);
  };

  switchEnvironment = (location, cash) => {
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name === "arrowGroup") {
        this.scene.remove(this.scene.children[i]);
      }
    }
    this.currentLocation.switchTexture(location);
    const { id, coords, siblings, src } = this.currentLocation;

    this.currentLocation.loadTexture(() => {
      this.reactComponent.updateId(id);
      this.mainSphere.setTexture(this.currentLocation.texture);
      this.createArrows(siblings, coords);
      this.reactComponent.closeModalMap()
    })
  };

  getIntersects = (x, y) => {
    x = (x / window.innerWidth) * 2 - 1;
    y = -(y / window.innerHeight) * 2 + 1;

    this.mouse.set(x, y, 0.5);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    return this.raycaster.intersectObject(this.arrowGroup.arrowGroup, true);
  };

  animate = (time) => {
    requestAnimationFrame(this.animate);
    this.update();
    TWEEN.update(time);
  };

  update = () => {
    const delta = 500;

    this.lat = Math.max(-85, Math.min(85, this.lat));
    this.phi = THREE.MathUtils.degToRad(90 - this.lat);
    this.theta = THREE.MathUtils.degToRad(this.lon);

    if (!this.isSphereAnimation) {
      this.camera.target.x = delta * Math.sin(this.phi) * Math.cos(this.theta);
      this.camera.target.y = delta * Math.cos(this.phi);
      this.camera.target.z = delta * Math.sin(this.phi) * Math.sin(this.theta);
      this.camera.lookAt(this.camera.target);
    }

    this.renderer.render(this.scene, this.camera);
  };

  addObject = (object) => {
    this.scene.add(object);
  };
}
