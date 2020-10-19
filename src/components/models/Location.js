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

  isContains(arr, curID) {
    return arr.find(({id}) => id === curID);
  } 

  loadTexture = async (id,isSpinner) => {
    const location = this.isContains(this.APP.locations,id);
    console.log(location)
    if (location){
      return location;
    } else {
      return new Promise(resolve => {
        if (isSpinner){
          this.reactComponent.startLoadImage()
        }
        this.loader.load(`/textures/${this.src}`, texture => {
          if (isSpinner){
            this.reactComponent.endLoadImage()
          }
          this.texture = texture;
          resolve(texture)
        })
      })
    }
  }

}