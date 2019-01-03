import React, { Component } from 'react';
import './DisplayCurrently.css';
import DisplayCondition from './DisplayCondition';
import DisplayTemp from '../DisplayTempComponents/DisplayTemp';
import partCloudIcon from "../../img/Cloud-Sun.svg";
import precipIcon from "../../img/Umbrella.svg";

class DisplayCurrently extends Component {
  render () {
    const conditions = this.props.conditions;

    return (
      <div className="display-currently">
        <DisplayCondition type="icon" value={partCloudIcon}/>
        <div className="prob-precip">
          <DisplayCondition type="icon" value={precipIcon} />
          <DisplayCondition type="precip-prob" value=".35" />
        </div>
      </div>
    );
  }
}

export default DisplayCurrently;