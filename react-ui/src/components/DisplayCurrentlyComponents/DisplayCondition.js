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

class DisplayPrecipPercent extends Component {
  render () {
    const percentValue = this.props.value * 100;
    const precipIcon = this.value;

    return (
      <React.Fragment>
        <div className="display-percent">
          <img src={precipIcon}></img>
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
    } else if (type === 'precip-prob') {
      displayFragment = <DisplayPrecipPercent value={value} />
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