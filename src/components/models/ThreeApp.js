import * as THREE from "three";
import textures from "../../data";
import TWEEN from "@tweenjs/tween.js";

import Sphere from "./Sphere";
import Arrows from "./Arrows";
import * as helpers from "../../helperFunctions";
export default class ThreeApp {
  lon = 0;
  lat = 0;
  phi = 0;
  theta = 0;

  isSphereAnimation = false;

  initBaseControls = (reactComponent) => {
    // объявить камеру
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    this.camera.target = new THREE.Vector3(0, 0, 0);

    // объявить сцену
    this.scene = new THREE.Scene();

    // движок
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelector(".canvas").appendChild(this.renderer.domElement);

    // координаты мыши
    this.mouse = new THREE.Vector2();

    // "слушатель"
    this.raycaster = new THREE.Raycaster();

    this.initEvents();
    this.reactComponent = reactComponent;
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
          const siblingTexture = textures.filter(({ id }) => id === res.object.name)[0]; // сиблинг по которому кликнули
          const currentTexture = textures.filter(({ id }) => id === this.currentId)[0]; // текущая текстура

          const unit_vec = helpers.getUnicVector(
            currentTexture.coords,
            siblingTexture.coords
          );

          // создать other сферу и расположить ее на 20ед дальше по прямой
          const coefficient = 20;
          const newCoords = {
            x: unit_vec.x * coefficient,
            y: unit_vec.y * coefficient,
            z: unit_vec.z * coefficient,
          };

          const loader = new THREE.TextureLoader();

          // вырубить все управление
          this.isSphereAnimation = true;
          // поворот камеры
          this.camera.lookAt(newCoords.x, 0, newCoords.z);

          this.reactComponent.startLoadImage()
          loader.load(`/textures/${siblingTexture.src}`, texture => {
            this.reactComponent.endLoadImage()
            this.otherSphere.setTexture(texture);
            this.otherSphere.changePosition(newCoords.x, newCoords.y, newCoords.z);

            //tween анимация
            function animate(time) {
              requestAnimationFrame(animate);
              TWEEN.update(time);
            }
            requestAnimationFrame(animate);

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
                this.switchEnvironment(siblingTexture,false);
              });
          });
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

  createMainSphere = (params) => {
    const sphere = new Sphere("main");
    sphere.createMesh(params);
    this.mainSphere = sphere;
    this.scene.add(this.mainSphere.sphere);
  };

  createOtherSphere = (params) => {
    const sphere = new Sphere("other");
    sphere.createMesh(params);
    this.otherSphere = sphere;
    this.scene.add(this.otherSphere.sphere);
  };

  createArrows = (siblings, coords) => {
    const arrows = new Arrows("arrowGroup");
    arrows.init(siblings, coords);
    this.arrowGroup = arrows;
    this.scene.add(this.arrowGroup.arrowGroup);
  };

  switchEnvironment = ({ src, coords, siblings, id },cash) => {
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name === "arrowGroup") {
        this.scene.remove(this.scene.children[i]);
      }
    }
    const loader = new THREE.TextureLoader();
    if (cash) {
      this.reactComponent.startLoadImage()
    }

    loader.load(`/textures/${src}`, texture => {
      if (cash) {
        this.reactComponent.endLoadImage()
      }
      this.reactComponent.updateId(id);
      this.currentId = id;
      this.mainSphere.setTexture(texture);
      this.createArrows(siblings, coords);
      this.reactComponent.closeModalMap()
    });
  };

  getIntersects = (x, y) => {
    x = (x / window.innerWidth) * 2 - 1;
    y = -(y / window.innerHeight) * 2 + 1;

    this.mouse.set(x, y, 0.5);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    return this.raycaster.intersectObject(this.arrowGroup.arrowGroup, true);
  };

  animate = () => {
    requestAnimationFrame(this.animate);
    this.update();
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
