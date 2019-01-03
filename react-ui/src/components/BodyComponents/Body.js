
import React, { Component } from "react";
import "./Body.css";
import DateSelector from "../DateSelectorComponents/DateSelector";
import LocationSearch from "../LocationSearchComponents/LocationSearch";
import DisplayTemp from "../DisplayTempComponents/DisplayTemp";
import Graph from "../GraphComponents/Graph";
import statusIcon from '../../img/Cloud-Sun.svg'

class Body extends Component {
  render() {
    return (
      <div className="body">
        <LocationSearch />
        <div className="data-display">
          <Graph />
          <div className="weather-alerts-place-holder">
            <img src={statusIcon}></img>
            High temp: <DisplayTemp temp="65" unit="" type="high" />
            Low temp: <DisplayTemp temp="35" unit="" type="low" />
            Current temp: <DisplayTemp temp="45" unit="F" type="current" />
          </div>
        </div>
        <DateSelector />
      </div>
    );
  }
}

export default Body;
