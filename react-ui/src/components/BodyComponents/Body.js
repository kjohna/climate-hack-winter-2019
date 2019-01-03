
import React, { Component } from "react";
import "./Body.css";
import DateSelector from "../DateSelectorComponents/DateSelector";
import LocationSearch from "../LocationSearchComponents/LocationSearch";
import DisplayTemp from "../DisplayTempComponents/DisplayTemp";
import Graph from "../GraphComponents/Graph";
import statusIcon from '../../img/Cloud-Sun.svg';
import precipIcon from "../../img/Umbrella.svg";
import DisplayCurrently from '../DisplayCurrentlyComponents/DisplayCurrently';
import WeatherAlerts from "../WeatherAlertsComponents/WeatherAlerts";
import conditions from "../GraphComponents/sampleData.json";

class Body extends Component {
  render() {
    return (
      <div className="body">
        <LocationSearch />
        <div className="data-display">
          <Graph />
          <DisplayCurrently conditions={conditions} />
          {/* <div className="display-currently">
            <DisplayCondition type="icon" value={precipIcon} />
            <DisplayCondition type="precip-prob" value=".35" />
            <img src={statusIcon}></img>
            High temp: <DisplayTemp temp="65" unit="" type="high" />
          </div> */}
        </div>
        <WeatherAlerts />
        {/* <DateSelector /> */}
      </div>
    );
  }
}

export default Body;
