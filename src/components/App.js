import React, { Component } from 'react';
import * as THREE from 'three';
import textures from '../data';
import Minimap from './MiniMap';

import Environment from './models/Environment'

export default class App extends Component {
  state = {
    isModalShow: false,
    currentId: null,
    isLoadImage: false
  }

  myEnvironment = new Environment(this,textures);

  componentDidMount() {
    this.myEnvironment.init();
    this.myEnvironment.animate();

    document.querySelector('.wrapper').addEventListener('click', (e) => {
      if (!e.target.classList.contains('map')) {
        this.setState({ isModalShow: false })
      }
    })
  }

  updateId = (id) => {
    this.setState({ currentId: id })
  }

  switchScene = (texture) => {
    this.myEnvironment.switchEnvironment(texture,true);
  }

  showModalMap = () => {
    this.setState({ isModalShow: true })
  }

  closeModalMap = () => {
    this.setState({ isModalShow: false })
  }

  startLoadImage = () => {
    this.setState({ isLoadImage: true })
  }

  endLoadImage = () => {
    this.setState({ isLoadImage: false })
  }

  render() {
    const { isModalShow, currentId, isLoadImage } = this.state;
    return (
      <div className="wrapper">
        <div className={isLoadImage ? "fade-block" : "hidden"}>
          <div className="spin-wrapper">
            <div className="spinner">
            </div>
          </div>
        </div>
        <div className="canvas"></div>
        <Minimap currentId={currentId} action={this.showModalMap} />
        <div className={isModalShow ? "fade-block" : "hidden"}>
          <div className="map">
            {textures.map(({ id, coords }, i) => (
              <span
                onClick={() => { this.switchScene(textures[i]) }}
                className="map-item"
                data-id={id}
                key={`${id}`}
                style={
                  {
                    top: `${coords.z * 25}px`,
                    left: `${coords.x * 25 + 130}px`,
                    backgroundColor: id === currentId ? 'blue' : 'greenyellow'
                  }
                }></span>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
