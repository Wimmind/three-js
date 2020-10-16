import React, { Component } from 'react';
import * as THREE from 'three';

import textures from '../data';

import Minimap from './MiniMap';

import TWEEN from '@tweenjs/tween.js';

let camera, scene, renderer,
  mouseDownMouseX, mouseDownMouseY, mouseDownLon, mouseDownLat,
  lon = 0, lat = 0, phi = 0, theta = 0;

let mouse, raycaster, arrowGroup;
let mainSphere, otherSphere;

let isSphereAnimation = false;


export default class App extends Component {
  state = {
    isModalShow: false,
    currentId: null
  }

  componentDidMount() {
    const { id, src, siblings, coords } = textures[0];
    this.setState({ currentId: id })

    this.initBaseControls()
    this.initMainSphere(src, siblings, coords);
    this.initOtherSphere()
    this.initArrows(siblings, coords);
    animate();

    document.querySelector('.wrapper').addEventListener('click', (e) => {
      if (!e.target.classList.contains('map')) {
        this.setState({ isModalShow: false })
      }
    })
  }

  initBaseControls = () => {
    // объявить камеру
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);
    // объявить сцену
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    // убрать размытие
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelector('.canvas').appendChild(renderer.domElement);

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    this.initEvents();
  }

  initEvents = () => {
    const windowEvenets = [
      { action: 'mousedown', evt: this.onPointerStart },
      { action: 'mousemove', evt: this.onPointerMove },
      { action: 'mouseup', evt: this.onPointerUp },
      { action: 'resize', evt: this.onWindowResize }
    ]
    windowEvenets.forEach(({ action, evt }) => {
      document.addEventListener(action, evt);
    })
  }

  deleteEvents = () => {
    const windowEvenets = [
      { action: 'mousedown', evt: this.onPointerStart },
      { action: 'mousemove', evt: this.onPointerMove },
      { action: 'mouseup', evt: this.onPointerUp },
      { action: 'resize', evt: this.onWindowResize }
    ]
    windowEvenets.forEach(({ action, evt }) => {
      document.removeEventListener(action, evt);
    })
  }

  initArrows = (siblings, currentCoords) => {
    arrowGroup = new THREE.Group();

    siblings.forEach(sibling => {
      const arrowGeometry = new THREE.Geometry();

      const currentSibling = (textures.filter(({ id }) => sibling === id)[0]);
      const { id, coords } = currentSibling;

      const unit_vec = getUnicVector(currentCoords, coords);
      const leftPoint = rotationMatrix(unit_vec, 45,)
      const rightPoint = rotationMatrix(unit_vec, -45)

      const x0 = (leftPoint.x + unit_vec.x + rightPoint.x) / 3;
      const z0 = (leftPoint.z + unit_vec.z + rightPoint.z) / 3;

      const newLeftPoint = resizeTriangle(leftPoint, x0, z0)
      const newRightPoint = resizeTriangle(rightPoint, x0, z0)
      const newMiddlePoint = resizeTriangle(unit_vec, x0, z0)

      const coefficient = 5;
      arrowGeometry.vertices.push(
        new THREE.Vector3(newLeftPoint.x * (coefficient - 1), -3, newLeftPoint.z * (coefficient - 1)),
        new THREE.Vector3(newMiddlePoint.x * coefficient, -3, newMiddlePoint.z * coefficient),
        new THREE.Vector3(newRightPoint.x * (coefficient - 1), -3, newRightPoint.z * (coefficient - 1))
      );
      arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));

      const material = new THREE.LineBasicMaterial({ color: 'red', linewidth: 2 });
      const mesh = new THREE.Mesh(arrowGeometry, material);
      mesh.name = id;

      arrowGroup.add(mesh);
    });
    arrowGroup.name = 'arrowGroup';
    scene.add(arrowGroup);
  }

  initMainSphere = (src, siblings, coords) => {
    const sphere = this.initSphere();
    const img = `/textures/${src}`;
    const texture = new THREE.TextureLoader().load(img);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 1 });
    mainSphere = new THREE.Mesh(sphere, material);
    mainSphere.name = 'main';
    scene.add(mainSphere);
  }

  initOtherSphere = () => {
    const sphere = this.initSphere();
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    otherSphere = new THREE.Mesh(sphere, material);
    otherSphere.name = 'other';
    otherSphere.position.set(0, -10000, 0);
    scene.add(otherSphere);
  }

  initSphere = () => {
    const geometrySphere = new THREE.SphereBufferGeometry(10, 60, 40);
    geometrySphere.scale(-1, 1, 1);
    return geometrySphere;
  }

  onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  onPointerStart = (event) => {
    var clientX = event.clientX || event.touches[0].clientX;
    var clientY = event.clientY || event.touches[0].clientY;
    mouseDownMouseX = clientX;
    mouseDownMouseY = clientY;
    mouseDownLon = lon;
    mouseDownLat = lat;
  }

  switchScene = ({ src, coords, siblings, id }) => {
    for (let i = scene.children.length - 1; i >= 0; i--) {
      if (scene.children[i].name === 'arrowGroup')
        scene.remove(scene.children[i]);
    }
    this.setState({ currentId: id })

    const img = `/textures/${src}`;
    const texture = new THREE.TextureLoader().load(img);
    mainSphere.material.map = texture;
    mainSphere.material.needsUpdate = true;

    this.initArrows(siblings, coords);
    this.setState({ isModalShow: false })
  }

  onPointerMove = (event) => {
    if (!mouseDownMouseX) return;
    var clientX = event.clientX;
    var clientY = event.clientY;
    lon = (mouseDownMouseX - clientX) * camera.fov / 600 + mouseDownLon;
    lat = (clientY - mouseDownMouseY) * camera.fov / 600 + mouseDownLat;
  }

  onPointerUp = (event) => {
    mouseDownMouseX = null;

    const intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
      const res = intersects.filter(function (res) {
        return res && res.object
      })[0];
      if (res && res.object) {
        const siblingTexture = textures.filter(({ id }) => id === res.object.name)[0];// сиблинг по которому кликнули
        const currentTexture = textures.filter(({ id }) => id === this.state.currentId)[0];// текущая теккстура

        const unit_vec = getUnicVector(currentTexture.coords, siblingTexture.coords);

        // создать other сферу и расположить ее на 20ед дальше по ппрямой
        const coefficient = 20;
        const newCoords = {
          x: unit_vec.x * coefficient,
          y: unit_vec.y * coefficient,
          z: unit_vec.z * coefficient
        }

        const img = `/textures/${siblingTexture.src}`;
        const texture = new THREE.TextureLoader().load(img);
        otherSphere.material.map = texture;
        otherSphere.material.needsUpdate = true;

        otherSphere.position.set(newCoords.x, newCoords.y, newCoords.z);

        // вырубить все управление
        isSphereAnimation = true;
        this.deleteEvents();

        // поворот камеры
        camera.lookAt(newCoords.x, 0, newCoords.z);

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
            otherSphere.position.set(temp.x, temp.y, temp.z);
            mainSphere.material.opacity = temp.opacity;
            otherSphere.material.opacity = temp.opacity2;
          })
          .start()
          .onComplete(() => {
            mainSphere.material.opacity = 1;
            otherSphere.material.opacity = 0;
            otherSphere.position.set(0,-10000,0);

            this.initEvents();
            isSphereAnimation = false;
            this.switchScene(siblingTexture)
          });

      }
    }
  }

  showModalMap = () => {
    this.setState({ isModalShow: true })
  }

  render() {
    const { isModalShow, currentId } = this.state;
    return (
      <div className="wrapper">
        <div className="canvas"></div>
        <Minimap currentId={currentId} action={this.showModalMap} />
        <div className={isModalShow ? "fade-block" : "hidden"}>
          <div className="map">
            {textures.map(({ id, coords }, i) => (
              <span
                onClick={() => { this.switchScene(textures[i]) }}
                className="map-item"
                data-id={id}
                key={`${id}`}
                style={
                  {
                    top: `${coords.z * 25}px`,
                    left: `${coords.x * 25 + 130}px`,
                    backgroundColor: id === currentId ? 'blue' : 'greenyellow'
                  }
                }></span>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

function rotationMatrix({ x, y, z }, angle) {
  const cs = Math.cos(angle);
  const sn = Math.sin(angle);
  return {
    x: (x * cs - z * sn),
    y: y,
    z: (x * sn + z * cs)
  }
}

function resizeTriangle(point, x0, z0) {
  const k = 1 / 5;
  return {
    x: x0 + k * (point.x - x0),
    z: z0 + k * (point.z - z0)
  }
}

function animate() {
  requestAnimationFrame(animate);
  update();
}

function update() {
  const delta = 500;

  lat = Math.max(- 85, Math.min(85, lat));
  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);

  if (!isSphereAnimation) {
    camera.target.x = delta * Math.sin(phi) * Math.cos(theta);
    camera.target.y = delta * Math.cos(phi);
    camera.target.z = delta * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
  }

  renderer.render(scene, camera);
}

function getIntersects(x, y) {
  x = (x / window.innerWidth) * 2 - 1;
  y = - (y / window.innerHeight) * 2 + 1;

  mouse.set(x, y, 0.5);
  raycaster.setFromCamera(mouse, camera);

  return raycaster.intersectObject(arrowGroup, true);
}

function getUnicVector(currentCoords, siblingCoords) {
  const vec = {
    x: (siblingCoords.x - currentCoords.x),
    y: (siblingCoords.y - currentCoords.y),
    z: (siblingCoords.z - currentCoords.z)
  }
  const len_vec = Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2);
  return {
    x: vec.x / len_vec,
    y: vec.y / len_vec,
    z: vec.z / len_vec
  }
}

