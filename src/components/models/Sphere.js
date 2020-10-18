import * as THREE from 'three';


export default class Sphere {
  constructor(name) {
    this.name = name;
  };

  createMesh = (params) => {
    const geometrySphere = this.initSphere();
    const material = new THREE.MeshBasicMaterial(params);
    this.sphere = new THREE.Mesh(geometrySphere, material);
    this.sphere.name = this.name;
  }

  changePosition = (x,y,z) => {
    this.sphere.position.set(x, y, z);
  }

  changeOpacity = (number) => {
    this.sphere.material.opacity = number;
  }

  initSphere = () => {
    const geometrySphere = new THREE.SphereBufferGeometry(10, 60, 40);
    geometrySphere.scale(-1, 1, 1);
    return geometrySphere;
  }

  setTexture = (texture) => {
    this.sphere.material.map = texture;
    this.sphere.material.needsUpdate = true;
  }

}