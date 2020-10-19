import * as THREE from 'three';


export default class Sphere {
  constructor(name,params) {
    const geometrySphere = new THREE.SphereBufferGeometry(10, 60, 40);
    geometrySphere.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial(params);
    this.mesh = new THREE.Mesh(geometrySphere, material);
    this.mesh.name = name;
  };

  changePosition = (x,y,z) => {
    this.mesh.position.set(x, y, z);
  }

  changeOpacity = (number) => {
    this.mesh.material.opacity = number;
  }

  setTexture = (texture) => {
    this.mesh.material.map = texture;
    this.mesh.material.needsUpdate = true;
  }
}