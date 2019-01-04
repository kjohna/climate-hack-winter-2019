/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import data from "./weatherData.json";
import MetricsGraphics from "react-metrics-graphics";
import "./MetricsGraphics.css";

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    // console.log(data);
    console.log(data);
    const cleanData = [];
    data.forEach(function(each) {
      let tmpObj = {};
      let tmpDate = new Date(each.Date);
      tmpObj[`"Date"`] = `${tmpDate}`;
      tmpObj[`"Low"`] = `${each.Low}`;
      tmpObj[`"High"`] = `${each.High}`;
      cleanData.push(tmpObj);
      console.log(tmpObj);
    });
    console.log(`cleanData: ${cleanData}`);
    console.log(cleanData);
    return (
      <div className="mgraph">
        <MetricsGraphics
          title="Downloads"
          description="This graphic shows a time-series of downloads."
          data={[cleanData]}
          width={400}
          height={300}
          x_accessor="Low"
          y_accessor="High"
        />
      </div>
    );
  }
}

export default Graph;
