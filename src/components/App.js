import React, { Component } from 'react';
import * as threeFunctions from './three';

import textures from '../data.json'

//const img = 'https://i.imgur.com/GFLxXVV.jpg';

export default class App extends Component {
  state = {
    num: 0
  }

  componentDidMount() {
    const img = process.env.PUBLIC_URL + `/textures/${textures[0].src}`
    threeFunctions.init(img)
    threeFunctions.animate();
  }

  click = () => {
   // let num = this.state.num + 20;
    //const img = process.env.PUBLIC_URL + `/textures/${textures[1].src}`
    threeFunctions.posCam()
   // this.setState({num})
  }

  render() {
    return (
      <div className='wrapper'>
        <canvas id="canvas" width={800} height={500}></canvas>
        <button onClick={this.click}>давай</button>
      </div>
    );
  }
}
