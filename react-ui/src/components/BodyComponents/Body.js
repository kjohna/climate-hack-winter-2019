import React, { Component } from "react";
import "./Body.css";
import DateSelector from "../DateSelectorComponents/DateSelector";
import LocationSearch from "../LocationSearchComponents/LocationSearch";
import DisplayTemp from "../DisplayTempComponents/DisplayTemp";
import Graph from "../GraphComponents/Graph";

class Body extends Component {
  render() {
    return (
      <div className="body">
        <h1>Here is some body content.</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer at
          risus egestas, ultricies turpis sed, pulvinar lorem. Fusce placerat
          lobortis massa, vitae scelerisque sem convallis non. Phasellus ac
          magna ac quam scelerisque condimentum. Cras eget lorem a felis
          volutpat elementum eget id turpis. In vitae mi quis justo consectetur
          tincidunt. Etiam commodo vel velit sit amet auctor. Nulla imperdiet
          congue ipsum, id euismod lorem lacinia ac. Nulla vitae purus in diam
          tincidunt aliquam id vel nulla. Integer imperdiet sollicitudin
          elementum. Mauris non hendrerit tellus, iaculis hendrerit diam.
        </p>
        <Graph />
        <DateSelector />
        <LocationSearch />
        <DisplayTemp />
      </div>
    );
  }
}

export default Body;
