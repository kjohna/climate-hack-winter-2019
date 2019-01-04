/* eslint-disable no-unused-vars */
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
        <div class="map-widget"> <iframe  src="https://maps.darksky.net/@temperature,42.088,-94.567,4?domain=%22+encodeURIComponent(window.location.href)+%22&auth=1546575960_92b343a42fac1c0b889b8f8662a911fc&embed=true&timeControl=false&fieldControl=false&defaultField=temperature&defaultUnits=_f" width="555px" height="200px"   frameborder="0"></iframe></div>
         
         
      </div>
    );
  }
}

export default Body;
