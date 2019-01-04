import React, { Component } from 'react';
import './DisplayCurrently.css';
import DisplayCondition from './DisplayCondition';
import DisplayTemp from '../DisplayTempComponents/DisplayTemp';
import partCloudIcon from "../../img/Cloud-Sun.svg";
import rHIcon from "../../img/droplet.svg";

class DisplayCurrently extends Component {
  render () {
    const conditions = this.props.conditions;

    return (
      <div className="display-currently">
        <div className="temps">
          <DisplayTemp prefix="•" temp="47" unit="" type="high" />
          <DisplayTemp prefix="•" temp="43" unit="F" type="current" />
          <DisplayTemp prefix="•" temp="34" unit="" type="low" />  
        </div>
        <div className="conditions">
          <DisplayCondition type="icon" value={partCloudIcon}/>
          <div className="rel-humidity">
            <DisplayCondition type="icon" value={rHIcon} />
            <DisplayCondition type="rel-humidity" value=".35" />
          </div>
        </div>
      </div>
    );
  }
}

export default DisplayCurrently;