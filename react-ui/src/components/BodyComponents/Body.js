import React, { Component } from "react";
import "./Body.css";
import DateSelector from "../DateSelectorComponents/DateSelector";
import LocationSearch from "../LocationSearchComponents/LocationSearch";
import DisplayTemp from "../DisplayTempComponents/DisplayTemp";
import Graph from "../GraphComponents/Graph";
import MetricsGraphics from "react-metrics-graphics";
import "../GraphComponents/MetricsGraphics.css";
import statusIcon from "../../img/Cloud-Sun.svg";
import precipIcon from "../../img/Umbrella.svg";
import DisplayCurrently from "../DisplayCurrentlyComponents/DisplayCurrently";
import WeatherAlerts from "../WeatherAlertsComponents/WeatherAlerts";
import conditions from "../GraphComponents/weatherData.json";
import background01 from "../../img/sky01.jpg";
import background02 from "../../img/sky02.jpg";

class Body extends Component {
  render() {
    const bg02 = {
      backgroundImage: `url(${background02})`,
      backgroundSize: "contain",
      // backgroundRepeat: "no-repeat",
      width: "100%",
      height: "700px"
      // paddingTop: "66.67%"
    };
    return (
      <div className="body" /*style={bg02}*/>
        {/* <img src={background01} style={bg01} /> */}
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
