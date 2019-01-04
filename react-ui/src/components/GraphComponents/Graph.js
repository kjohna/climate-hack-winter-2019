/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import moment from "moment";
import data from "./weatherData.json";
import LineChart from "./LineChart";
import ToolTip from "./ToolTip";

class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePoint: null,
      toolTipTrigger: null,
      fetchingData: true,
      data: null
    };
  }

  handlePointHover = (point, trigger) => {
    this.setState({
      activePoint: point,
      toolTipTrigger: trigger
    });
  };

  componentWillMount() {
    console.log(this.state);
    // This function creates data that doesn't look entirely random
    const dataHigh = [];

    for (let x = 0; x <= 20; x++) {
      const random = Math.random();
      const temp = dataHigh.length > 0 ? dataHigh[dataHigh.length - 1].y : 50;
      const y =
        random >= 0.45
          ? temp + Math.floor(random * 20)
          : temp - Math.floor(random * 20);
      dataHigh.push({ x, y });
    }
    this.setState({
      dataHigh,
      fetchingData: false
    });
  }

  render() {
    return (
      <div className="tooltip">
        {this.state.toolTipTrigger ? (
          <ToolTip trigger={this.state.toolTipTrigger}>
            <div>y : {this.state.activePoint.y}</div>
            <div>x : {this.state.activePoint.x}</div>
          </ToolTip>
        ) : null}

        <div className="graph-header" />
        {!this.state.fetchingData ? (
          <LineChart
            data={this.state.dataHigh}
            onPointHover={this.handlePointHover}
          />
        ) : null}
      </div>
    );
  }
}

export default Graph;
