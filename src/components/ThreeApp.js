import * as THREE from 'three';
import textures from '../data';
import TWEEN from '@tweenjs/tween.js';

export default class ThreeApp {
  constructor() {
    
  };

  camera;
  scene;
  renderer;
  mouse;
  raycaster;
  mouseDownMouseX;
  mouseDownMouseY;
  mouseDownLon;
  mouseDownLat;
  lon = 0;
  lat = 0;
  phi = 0;
  theta = 0;

  arrowGroup;
  mainSphere;
  otherSphere;
  isSphereAnimation = false;

  windowEvenets = [
    { action: 'mousedown', evt: this.onPointerStart },
    { action: 'mousemove', evt: this.onPointerMove },
    { action: 'mouseup', evt: this.onPointerUp },
    { action: 'resize', evt: this.onWindowResize }
  ]

  initBaseControls = () => {
    // объявить камеру
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    this.camera.target = new THREE.Vector3(0, 0, 0);
    // объявить сцену
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    // убрать размытие
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelector('.canvas').appendChild(renderer.domElement);

    this.mouse = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();

    this.initEvents();
  }

  initEvents = () => {
    this.windowEvenets.forEach(({ action, evt }) => {
      document.addEventListener(action, evt);
    })
  }

  deleteEvents = () => {
    this.windowEvenets.forEach(({ action, evt }) => {
      document.removeEventListener(action, evt);
    })
  }

  onPointerStart = (event) => {
    const clientX = event.clientX || event.touches[0].clientX;
    const clientY = event.clientY || event.touches[0].clientY;
    this.mouseDownMouseX = clientX;
    this.mouseDownMouseY = clientY;
    this.mouseDownLon = this.lon;
    this.mouseDownLat = this.lat;
  }

  onPointerMove = (event) => {
    if (!mouseDownMouseX) return;
    const clientX = event.clientX;
    const clientY = event.clientY;
    this.lon = (this.mouseDownMouseX - clientX) * camera.fov / 600 + this.mouseDownLon;
    this.lat = (clientY - this.mouseDownMouseY) * camera.fov / 600 + this.mouseDownLat;
  }

  onPointerUp = (event) => {
    this.mouseDownMouseX = null;

    const intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
      const res = intersects.filter(function (res) {
        return res && res.object
      })[0];
      if (res && res.object) {
        const siblingTexture = textures.filter(({ id }) => id === res.object.name)[0];// сиблинг по которому кликнули
        const currentTexture = textures.filter(({ id }) => id === this.state.currentId)[0];// текущая теккстура

        const unit_vec = this.getUnicVector(currentTexture.coords, siblingTexture.coords);

        // создать other сферу и расположить ее на 20ед дальше по ппрямой
        const coefficient = 20;
        const newCoords = {
          x: unit_vec.x * coefficient,
          y: unit_vec.y * coefficient,
          z: unit_vec.z * coefficient
        }

        const img = `/textures/${siblingTexture.src}`;
        const texture = new THREE.TextureLoader().load(img);
        this.otherSphere.material.map = texture;
        this.otherSphere.material.needsUpdate = true;

        this.otherSphere.position.set(newCoords.x, newCoords.y, newCoords.z);

        // вырубить все управление
        this.isSphereAnimation = true;
        this.deleteEvents();

        // поворот камеры
        this.camera.lookAt(newCoords.x, 0, newCoords.z);

        //tween анимация
        function animate(time) {
          requestAnimationFrame(animate);
          TWEEN.update(time);
        }
        requestAnimationFrame(animate);

        let temp = { ...newCoords, opacity: 1, opacity2: 0 };

        var tween = new TWEEN.Tween(temp)
          .to({ x: 0, y: 0, z: 0, opacity: 0, opacity2: 1 }, 3000)
          .onUpdate(() => {
            this.otherSphere.position.set(temp.x, temp.y, temp.z);
            this.mainSphere.material.opacity = temp.opacity;
            this.otherSphere.material.opacity = temp.opacity2;
          })
          .start()
          .onComplete(() => {
            this.mainSphere.material.opacity = 1;
            this.otherSphere.material.opacity = 0;
            this.otherSphere.position.set(0, -10000, 0);

            this.initEvents();
            this.isSphereAnimation = false;
            this.switchScene(siblingTexture)
          });

      }
    }
  }

  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  switchScene = ({ src, coords, siblings, id }) => {
    for (let i = this.scene.children.length - 1; i >= 0; i--) {
      if (this.scene.children[i].name === 'arrowGroup'){
        this.scene.remove(scene.children[i]);
      }
    }

    //this.setState({ currentId: id }); !!!!!!!!!

    const img = `/textures/${src}`;
    const texture = new THREE.TextureLoader().load(img);

    this.mainSphere.material.map = texture;
    this.mainSphere.material.needsUpdate = true;

    this.initArrows(siblings, coords);
    //this.setState({ isModalShow: false });   !!!!!!!!
  }

  getIntersects = (x, y) => {
    x = (x / window.innerWidth) * 2 - 1;
    y = - (y / window.innerHeight) * 2 + 1;

    this.mouse.set(x, y, 0.5);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    return raycaster.intersectObject(this.arrowGroup, true);
  }



}

