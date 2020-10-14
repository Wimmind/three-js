import React, { Component } from 'react';
import textures from '../data';


export default class Minimap extends Component {
    // state = {
    //     currentTextureIndex : 0
    // }

    // componentDidUpdate() {
    //     const {currentTexture} = this.props;
    //     if (currentTexture) {
    //         this.setState({currentTextureIndex: currentTexture})
    //     }
    // }

    render() {
        const {currentTextureIndex} = this.props;

        return (
            <div className="minimap">
                {textures.map(({id,coords})=>(
                    <span className="minimap-item" key={`${id}`} style={
                        {
                        bottom: `${coords.z*15}px`, 
                        left: `${coords.x*15}px`,
                        backgroundColor: id-1 === currentTextureIndex ? 'blue' : 'greenyellow'
                        }
                    }></span>
                ))}
            </div>
        );
    }
  }
  