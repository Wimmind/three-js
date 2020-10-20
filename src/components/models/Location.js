import * as THREE from "three";

export default class Location {
  constructor({id,src,siblings}, reactComponent,APP) {
    this.id = id;
    this.src = src;
    this.reactComponent = reactComponent;
    this.APP = APP;
    this.siblings = siblings;
  }

  loadTexture = async (isSpinner) => {
    let find = this.APP.locations.find((location) => location.id === this.id)
    if (find) {
      return find.texture;
    } else {
      const loader = new THREE.TextureLoader();
      return new Promise((resolve) => {
        if (isSpinner) {
          this.reactComponent.startLoadImage();
        }
        loader.load(`/textures/${this.src}`, (texture) => {
          this.APP.locations.push(this)
          this.texture = texture;
          resolve(texture);
          if (isSpinner) {
            this.reactComponent.endLoadImage();
          }
        });
      });
    }
  };

  loadSiblings = (isSpinner) => {
    return Promise.all(this.siblings.map(async (id, key) => {
      return new Promise(async (resolve) => {
        let find = this.APP.locations.find((location) => location.id === id)
        if (find) {
          resolve(this)
        }
        else {
          let _location = new Location(this.APP.data.find((data) => id === data.id), this.reactComponent, this.APP);
          await _location.loadTexture(isSpinner)
          resolve(_location)
        }
      })
    }))
  }
}