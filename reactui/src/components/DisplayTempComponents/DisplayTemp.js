import React, { Component } from 'react';
import './DisplayTemp.css';

class DisplayTemp extends Component {
  render () {
    const prefix = this.props.prefix;
    const temp = this.props.temp;
    const unit = this.props.unit;
    const type = this.props.type; // high, low, current

    return (
      <div className={`display-temp ${type}-temp`}>
        <h2>{`${prefix} ${temp}°${unit}`}</h2>
      </div>
    );
  }
}

export default DisplayTemp;