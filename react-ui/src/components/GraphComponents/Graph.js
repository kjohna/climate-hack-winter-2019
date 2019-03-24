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
    if (this.prop.past === null  || this.prop.past === undefined) return null;
    return (
      <div className="mgraph">
        <MetricsGraphics
          description="This graphic shows a time-series of temperatures."
          data={this.props.past}
          width={380}
          height={300}
          x_accessor="date"
          y_accessor={["max", "min"]}
          min_y_from_data="true"
          point_size="4"
          x_axis="false"
          y_axis="false"
          legend={["HI", "LO"]}

          // baselines = {}
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
