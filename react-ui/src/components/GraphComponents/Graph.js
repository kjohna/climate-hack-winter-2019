/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import MetricsGraphics from "react-metrics-graphics";
import "./MetricsGraphics.css";
import { connect } from "react-redux";
import { get_temps } from "../../actions";

const zipcode = "33143";
class Graph extends Component {
  constructor(props) {
    super(props);
    this.props.get_temps(zipcode);
  }

  render() {
    // console.log(this.props.past);

    // console.log(this.props.get_temps(33143));
    // data.forEach(function(each) {
    //   let tmpObj = {};
    //   let tmpDate = new Date(each.Date);
    //   tmpObj[`"Date"`] = `${tmpDate}`;
    //   tmpObj[`"Low"`] = `${each.Low}`;
    //   tmpObj[`"High"`] = `${each.High}`;
    //   cleanData.push(tmpObj);
    //   console.log(tmpObj);
    // });
    // console.log(`cleanData: ${cleanData}`);
    // console.log(cleanData);
    return (
      <div className="mgraph">
        <MetricsGraphics
          title="Downloads"
          description="This graphic shows a time-series of downloads."
          data={this.props.past}
          width={380}
          height={300}
          x_accessor="date"
          y_accessor="max"
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  high: state.temps.max,
  low: state.temps.min,
  current: state.temps ? state.temps.currently || null : null,
  past: state.temps ? state.temps.ra || null : null
});
const mapDispatchToProps = dispatch => ({
  get_temps: zip => dispatch(get_temps(zip))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Graph);
