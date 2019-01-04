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
    // const current= this.props.current.filter(function(temp){return this.})
    // console.log(this.props.current.temperature);
    return (
      <div className="mgraph">
        <MetricsGraphics
          description="This graphic shows a time-series of temperatures."
          data={this.props.past}
          width={400}
          height={300}
          x_accessor="date"
          y_accessor={["max", "min"]}
          min_y_from_data="true"
          show_year_markers="true"
          point_size="4"
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
