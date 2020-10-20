import React, { Component } from 'react';
import textures from '../data';


export default class Minimap extends Component {
	render() {
		const { currentId, action } = this.props;

		return (
			<div className="minimap" onClick={action} >
				{textures.map(({ id, coords }) => (
					<span
						className="minimap-item"
						key={`${id}`}
						style={
							{
								top: `${coords.z * 15}px`,
								left: `${coords.x * 15 + 50}px`,
								backgroundColor: id === currentId ? 'blue' : 'greenyellow'
							}
						}></span>
				))}
			</div>
		);
	}
}
