import React, { Component } from 'react';
import * as threeFunctions from './three';

import textures from '../data';
import Sphere from './Sphere';

//const img = 'https://i.imgur.com/GFLxXVV.jpg';

export default class App extends Component {
  state = {
    currentTexture: 0
  }

  componentDidMount() {
    const texture = this.state.currentTexture
    threeFunctions.init(textures[texture])
    threeFunctions.animate();
  }

  click = () => {
   // threeFunctions.posCam()
   const next =  this.state.currentTexture+1
   this.setState({currentTexture: next})
   threeFunctions.init(textures[next])
   threeFunctions.animate();
  }

  render() {
    return (
      <div>
         <div className='wrapper'></div>
         
      </div>
    );
  }
}

/*<button style={{marginTop: '30px'}} onClick={this.click}>skjghskghkghshgskhgjhgdj</button>*/
