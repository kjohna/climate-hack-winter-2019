/* eslint-disable jsx-a11y/alt-text */

import React, { Component } from 'react';
import './DisplayCurrently.css';

class DisplayIcon extends Component {
  render () {
    const statusIcon = this.props.value;

    return (
      <React.Fragment>
        <img className="condition-icon" src={statusIcon}></img>
      </React.Fragment>
    );
  }
}

class DisplayRHPercent extends Component {
  render () {
    const percentValue = Math.round(this.props.value * 100);
    const rHIcon = this.value;

    return (
      <React.Fragment>
        <div className="condition-rh-percent">
          <img src={rHIcon}></img>
          <h2>{`${percentValue}%`}</h2>
        </div>
      </React.Fragment>
    );
  }
}

class DisplayCondition extends Component {
  render () {
    const type = this.props.type;
    const value = this.props.value;
    let displayFragment = null;

    if (type === 'icon') {
      displayFragment = <DisplayIcon value={value} />
    } else if (type === 'rel-humidity') {
      displayFragment = <DisplayRHPercent value={value} />
    } else {
      console.log("Error in DisplayCondition: unknown type");
    }

    return (
      <div className="condition">
        {displayFragment}
      </div>
    );
  }
}

export default DisplayCondition;