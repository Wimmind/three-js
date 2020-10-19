import * as THREE from "three";
import textures from "../../data";

export default class Location {
  constructor(id,src, reactComponent, APP) {
    this.id = id;
    this.src = src;
    this.reactComponent = reactComponent;
    this.APP = APP;
  }
  loader = new THREE.TextureLoader();

  loadTexture = async (isSpinner) => {
    return new Promise(resolve => {
      if (isSpinner){
        this.reactComponent.startLoadImage()
      }
      this.loader.load(`/textures/${this.src}`, texture => {
        if (isSpinner){
          this.reactComponent.endLoadImage()
        }
        this.texture = texture;
        resolve({id: this.id,texture})
      })
    })
  }
}