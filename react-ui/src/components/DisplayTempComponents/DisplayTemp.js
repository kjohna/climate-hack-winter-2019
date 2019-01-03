import React, { Component } from 'react';
import './DisplayTemp.css';

class DisplayTemp extends Component {
  render () {
    const temp = 35;
    const unit = 'F';

    return (
      <div className="display-temp">
        The temperature is: {`${temp}°${unit}`}
      </div>
    );
  }
}

export default DisplayTemp;