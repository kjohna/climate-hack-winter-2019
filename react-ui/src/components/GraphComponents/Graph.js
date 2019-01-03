import React, { Component } from "react";
import moment from "moment";
// import './App.css';
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
      fetchingData: true,
      data: null,
      hoverLoc: null,
      activePoint: null
    };
  }
  handleChartHover(hoverLoc, activePoint) {
    this.setState({
      hoverLoc: hoverLoc,
      activePoint: activePoint
    });
  }
  componentDidMount() {
    const getData = () => {
      const weatherData = weather
        .getTimeMachine(zip, "+3y", null, null, [])
        // , "", "", [
        //   "minutely",
        //   "hourly",
        //   "currently",
        //   "alerts",
        // "flags"]
        //   )
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });

      //   fetch(url)
      //     .then(r => r.json())
      //     .then(bitcoinData => {
      //       const sortedData = [];
      //       let count = 0;
      //       for (let date in bitcoinData.bpi) {
      //         sortedData.push({
      //           d: moment(date).format("MMM DD"),
      //           p: bitcoinData.bpi[date].toLocaleString("us-EN", {
      //             style: "currency",
      //             currency: "USD"
      //           }),
      //           x: count, //previous days
      //           y: bitcoinData.bpi[date] // numerical price
      //         });
      //         count++;
      //       }
      //       this.setState({
      //         data: sortedData,
      //         fetchingData: false
      //       });
      //     })
      //     .catch(e => {
      //       console.log(e);
      //     });
    };
    getData();
  }
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="popup">
            {this.state.hoverLoc ? (
              <ToolTip
                hoverLoc={this.state.hoverLoc}
                activePoint={this.state.activePoint}
              />
            ) : null}
          </div>
        </div>
        <div className="row">
          <div className="chart">
            {!this.state.fetchingData ? (
              <LineChart
                data={this.state.data}
                onChartHover={(a, b) => this.handleChartHover(a, b)}
              />
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Graph;
