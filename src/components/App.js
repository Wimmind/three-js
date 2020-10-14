import React, { Component } from 'react';
import * as THREE from 'three';
import textures from '../data';

import Minimap from './MiniMap';

let camera, scene, renderer,
  mouseDownMouseX, mouseDownMouseY, mouseDownLon, mouseDownLat,
  lon = 0, lat = 0, phi = 0, theta = 0;

let mouse, raycaster, arrowGroup;
let mainSphere, otherSphere;


export default class App extends Component {
  state = {
    isModalShow: false,
    currentId: null
  }

  componentDidMount() {
    const { id, src, siblings, coords } = textures[0];
    this.setState({currentId: id})

    this.init()
    this.initMainSphere(src, siblings, coords);
    this.initOtherSphere()

    animate();

    document.querySelector('.wrapper').addEventListener('click', (e) => {
      if (!e.target.classList.contains('map')) {
        this.setState({ isModalShow: false })
      }
    })
  }

  init = () => {
    // объявить камеру
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);
    // объявить сцену
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    // убрать размытие
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    document.querySelector('.canvas').innerHTML = '';
    document.querySelector('.canvas').appendChild(renderer.domElement);

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

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

  initArrows = (siblings, coords) => {
    arrowGroup = new THREE.Group();

    siblings.forEach(sibling => {
      let arrowGeometry = new THREE.Geometry();

      const { x, y, z } = (textures.filter(({ id }) => sibling === id)[0].coords);
      const siblingId = (textures.filter(({ id }) => sibling === id)[0].id);
      const coefficient = 5;
      const vec = {
        x: (x - coords.x),
        y: (y - coords.y),
        z: (z - coords.z)
      }
      const len_vec = Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2);
      const unit_vec = {
        x: vec.x / len_vec,
        y: vec.y / len_vec,
        z: vec.z / len_vec
      }

      const leftPoint = rotationMatrix(unit_vec, 45,)
      const rightPoint = rotationMatrix(unit_vec, -45)

      const x0 = (leftPoint.x + unit_vec.x + rightPoint.x) / 3;
      const z0 = (leftPoint.z + unit_vec.z + rightPoint.z) / 3;

      const newLeftPoint = resizeTriangle(leftPoint, x0, z0)
      const newRightPoint = resizeTriangle(rightPoint, x0, z0)
      const newMiddlePoint = resizeTriangle(unit_vec, x0, z0)

      arrowGeometry.vertices.push(
        new THREE.Vector3(newLeftPoint.x * (coefficient - 1), -3, newLeftPoint.z * (coefficient - 1)),
        new THREE.Vector3(newMiddlePoint.x * coefficient, -3, newMiddlePoint.z * coefficient),
        new THREE.Vector3(newRightPoint.x * (coefficient - 1), -3, newRightPoint.z * (coefficient - 1))
      );

      arrowGeometry.faces.push(new THREE.Face3(0, 1, 2));

      const material = new THREE.LineBasicMaterial({ color: 'red', linewidth: 2 });
      const mesh = new THREE.Mesh(arrowGeometry, material);
      mesh.name = siblingId;

      arrowGroup.add(mesh);
    });
    arrowGroup.name = 'arrowGroup';
    scene.add(arrowGroup);
  }

  initMainSphere = (src, siblings, coords) => {
    mainSphere = this.initSphere();
    const mesh = this.createMesh(mainSphere, src, 'main');
    scene.add(mesh);
    this.initArrows(siblings, coords);
  }

  initOtherSphere = () => {
    otherSphere = this.initSphere();
  }

  initSphere = () => {
    const geometrySphere = new THREE.SphereBufferGeometry(10, 60, 40);
    geometrySphere.scale(-1, 1, 1);
    return geometrySphere;
  }

  createMesh = (object, src, name) => {
    const img = process.env.PUBLIC_URL + `/textures/${src}`
    const texture = new THREE.TextureLoader().load(img);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(object, material);
    mesh.name = name;
    return mesh;
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

    const intersects = getIntersects(event.layerX, event.layerY);
    if (intersects.length > 0) {
      const res = intersects.filter(function (res) {
        return res && res.object
      })[0];
      if (res && res.object) {
        const sibling = textures.filter(({ id }) => id === res.object.name)[0];
        this.switchScene(sibling)

      }
    }
  }

  switchScene = ({ src, coords, siblings, id }) => {
    for (let i = scene.children.length - 1; i >= 0; i--) {
      if (scene.children[i].name === 'main' || scene.children[i].name === 'arrowGroup') {
        scene.remove(scene.children[i]);
      }
    }
    this.setState({ currentId: id})

    const mesh = this.createMesh(mainSphere, src, 'main');
    scene.add(mesh);
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

  onPointerUp = () => {
    mouseDownMouseX = null;
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
                    left: `${coords.x * 25}px`,
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

// <button onClick={this.click}>skjghskghkghshgskhgjhgdj</button>

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
  const k = 1 / 4;
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

  camera.target.x = delta * Math.sin(phi) * Math.cos(theta);
  camera.target.y = delta * Math.cos(phi);
  camera.target.z = delta * Math.sin(phi) * Math.sin(theta);
  camera.lookAt(camera.target);

  renderer.render(scene, camera);
}

function getIntersects(x, y) {
  x = (x / window.innerWidth) * 2 - 1;
  y = - (y / window.innerHeight) * 2 + 1;

  mouse.set(x, y, 0.5);
  raycaster.setFromCamera(mouse, camera);

  return raycaster.intersectObject(arrowGroup, true);
}


