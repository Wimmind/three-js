import * as THREE from 'three';
import textures from '../../data';

import * as helpers from '../../helperFunctions';

export default class Arrows {
  constructor(name) {
    this.name = name;
  };

  init = (siblings, currentCoords) => {
    this.arrowGroup = new THREE.Group();

    siblings.forEach(sibling => {
      const arrowGeometry = new THREE.Geometry();

      const currentSibling = (textures.filter(({ id }) => sibling === id)[0]);
      const { id, coords } = currentSibling;

      const unit_vec = helpers.getUnicVector(currentCoords, coords);
      const leftPoint = helpers.rotationMatrix(unit_vec, 45,)
      const rightPoint = helpers.rotationMatrix(unit_vec, -45)

      const x0 = (leftPoint.x + unit_vec.x + rightPoint.x) / 3;
      const z0 = (leftPoint.z + unit_vec.z + rightPoint.z) / 3;

      const newLeftPoint = helpers.resizeTriangle(leftPoint, x0, z0)
      const newRightPoint = helpers.resizeTriangle(rightPoint, x0, z0)
      const newMiddlePoint = helpers.resizeTriangle(unit_vec, x0, z0)

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

      this.arrowGroup.add(mesh);
    });
    this.arrowGroup.name = this.name;
  }
}
