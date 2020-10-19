import React, { Component } from 'react';
import * as THREE from 'three';
import textures from '../data';
import Minimap from './MiniMap';

import ThereApp from './models/ThreeApp'

export default class App extends Component {
  state = {
    isModalShow: false,
    currentId: null,
    isLoadImage: false
  }

  myScene = new ThereApp();

  componentDidMount() {
    const { id, src, siblings, coords } = textures[0];
    this.setState({ currentId: id })

    this.myScene.currentId = id;

    this.myScene.initBaseControls(this);

    this.myScene.createMainSphere({
      map: new THREE.TextureLoader().load(`/textures/${src}`),
      transparent: true,
      opacity: 1
    });

    this.myScene.createOtherSphere({
      transparent: true,
      opacity: 0
    });

    this.myScene.createArrows(siblings, coords)

    this.myScene.animate();

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
    this.myScene.switchEnvironment(texture);
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
