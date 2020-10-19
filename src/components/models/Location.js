import * as THREE from "three";
import textures from "../../data";

export default class Location {
  constructor({id,siblings,coords,src},reactComponent) {
    this.id = id;
    this.siblings = siblings;
    this.coords = coords;
    this.src = src;
    this.reactComponent = reactComponent;
  }
  loader = new THREE.TextureLoader();

  loadTexture = (callback=()=>{}) => {
    this.reactComponent.startLoadImage()
    this.loader.load(`/textures/${this.src}`, texture => {
      this.reactComponent.endLoadImage()
      this.texture = texture;
      callback();
    })
  }

  switchTexture = ({id,siblings,coords,src}) => {
    this.id = id;
    this.siblings = siblings;
    this.coords = coords;
    this.src = src;
  }

  loadSiblingsTexture = (img,callback=()=>{}) => {
    this.reactComponent.startLoadImage()
    this.loader.load(img, texture => {
      this.reactComponent.endLoadImage()
      this.siblingTexture = texture;
      callback();
    })
  }
}