
import textures from '../data'

export default class Sphere {
  constructor({id, texture, coords}) {
    this.id = id;
    this.texture = texture;
    const {x,y,z} = coords;
    this.x = x;
    this.y = y;
    this.z = z;
  }
}