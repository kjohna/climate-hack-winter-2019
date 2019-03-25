/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import './DisplayCurrently.css';
import DisplayCondition from './DisplayCondition';
import DisplayTemp from '../DisplayTempComponents/DisplayTemp';
import partCloudIcon from "../../img/Cloud-Sun.svg";
import rHIcon from "../../img/droplet.svg";
import { connect } from "react-redux"

let count = 0;
class DisplayCurrently extends Component {
  constructor(props) {
    super(props);
    this.state={loaded: false};
  }

  async componentDidMount() {
    await mapDispatchToProps();
    this.setState({loaded: true});
  }

  content () {
    const conditions = this.props.conditions;
    // for some reason componentDidMount is being called many times, complete data isn't available until it is called the 2nd time, the next two lines avoid rendering content until complete data is available
    count ++;
    if(count<2){return null};
    if (this.props.current === undefined || this.props.current === null)  return null;
    // console.log("here");
    // console.log(this.props);
    const currentTemp = this.state.loaded ? Math.round(this.props.current.temperature) : 0;
    const highTemp = this.state.loaded ? Math.round(this.props.high) : 0;
    const lowTemp = this.state.loaded ? Math.round(this.props.low) : 0;
    const currentRH = this.state.loaded ? this.props.current.humidity : 0;
    // console.log(currentRH);

    return (
      <div className="display-currently">
        <div className="temps">
          <DisplayTemp prefix="•" temp={highTemp} unit="" type="high" />
          <DisplayTemp prefix="•" temp={currentTemp} unit="F" type="current" />
          <DisplayTemp prefix="•" temp={lowTemp} unit="" type="low" />  
        </div>
        <div className="conditions">
          <DisplayCondition type="icon" value={partCloudIcon}/>
          <div className="rel-humidity">
            <DisplayCondition type="icon" value={rHIcon} />
            <DisplayCondition type="rel-humidity" value={currentRH} />
          </div>
        </div>
      </div>
    );
  }

  render() {
    // console.log("inside render()");
    // console.log(this.props);
    return (
      <React.Fragment>
        {this.state.loaded ? this.content() : null}
      </React.Fragment>
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
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisplayCurrently);

