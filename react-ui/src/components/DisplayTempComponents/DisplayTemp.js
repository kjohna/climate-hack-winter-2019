import React, { Component } from 'react';
import './DisplayTemp.css';

class DisplayTemp extends Component {
  render () {
    const temp = 35;
    const unit = 'F';

    return (
      <div className="display-temp">
        <h2>{`${temp}°${unit}`}</h2>
      </div>
    );
  }
}

export default DisplayTemp;