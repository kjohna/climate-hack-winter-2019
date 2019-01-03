import React, { Component } from "react";
import moment from "moment";
import data from "./weatherData.json";
import LineChart from "./LineChart";
import ToolTip from "./ToolTip";

const dskey = "f39109d1263aa6b04983e1c34ef1e3df";
const gmapkey = "AIzaSyCd8iUXQ2EfQF-LktLoJzgJ4toV7Q8ZW40";
const zip = "07960";

const simplesky = require("simplesky");
var weather = new simplesky(gmapkey, dskey);

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
    const data = [];

    for (let x = 0; x <= 30; x++) {
      const random = Math.random();
      const temp = data.length > 0 ? data[data.length - 1].y : 50;
      const y =
        random >= 0.45
          ? temp + Math.floor(random * 20)
          : temp - Math.floor(random * 20);
      data.push({ x, y });
    }
    this.setState({
      data,
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

        <div className="header">TEST CHART</div>
        {!this.state.fetchingData ? (
          <LineChart
            data={this.state.data}
            onPointHover={this.handlePointHover}
          />
        ) : null}
      </div>
    );
  }
}

export default Graph;
