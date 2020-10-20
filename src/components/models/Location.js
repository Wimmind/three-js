import * as THREE from "three";

export default class Location {
  constructor(id,src, reactComponent,APP) {
    this.id = id;
    this.src = src;
    this.reactComponent = reactComponent;
    this.APP = APP;
  }

  loadTexture = async (isSpinner) => {
    const objectTexture = this.APP.textures.find((texture) => texture.id === this.id);
    if (objectTexture) {
      return objectTexture.texture;
    } else {
      const loader = new THREE.TextureLoader();
      return new Promise((resolve) => {
        if (isSpinner) {
          this.reactComponent.startLoadImage();
        }
        loader.load(`/textures/${this.src}`, (texture) => {
          if (isSpinner) {
            this.reactComponent.endLoadImage();
          }
          this.APP.textures.push({ id: this.id, texture })
          resolve(texture);
        });
      });
    }
  };

  loadSiblingsTexture = () => {

  }
}