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
import { get_temps } from "../../actions";
import { connect } from "react-redux"

class Body extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      zip: this.zipChoice
    };
  }

  set_zip = (zip) => {
    if (this.state.zip !== zip && /(\d{5}$)|(\d{5}-\d{4})$/.test(zip)) {
      // console.log(`setting zip to ${zip}`)
      this.props.get_temps(zip)
      this.setState({
        zip: zip
      })
    }
  }

  render() {
    const bg02 = {
      backgroundImage: `url(${background02})`,
      backgroundSize: "contain",
      // backgroundRepeat: "no-repeat",
      width: "100%"
      // height: "700px"
      // paddingTop: "66.67%"
    };
    let lat = this.props.lat || 42.088;
    let lng = this.props.lng || -94.567;
    // console.log(`lat: ${lat} lng: ${lng}`)
    const src = `https://maps.darksky.net/@temperature,${lat},${lng},4?domain=%22+encodeURIComponent(window.location.href)+%22&auth=1546575960_92b343a42fac1c0b889b8f8662a911fc&embed=true&timeControl=false&fieldControl=false&defaultField=temperature&defaultUnits=_f`
    return (
      <div className="body" style={bg02}>
        {/* <img src={background01} style={bg01} /> */}
        <LocationSearch zip={this.set_zip} />
        <div className="data-display">
          <Graph />

          <DisplayCurrently conditions={conditions} zip={this.state.zip} />
          {/* <div className="display-currently">
            <DisplayCondition type="icon" value={precipIcon} />
            <DisplayCondition type="precip-prob" value=".35" />
            <img src={statusIcon}></img>
            High temp: <DisplayTemp temp="65" unit="" type="high" />
          </div> */}
        </div>
        <WeatherAlerts className="map-widget" width="555px" frameBorder="0"/>
        <div className="map-widget">
          {" "}
          <iframe
            title="temp-map-iframe"
            src={src}
            width="555px"
            height="200px"
            frameBorder="0"
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  lat: state.temps.location ? state.temps.location.lat : null,
  lng: state.temps.location ? state.temps.location.lng : null
});
const mapDispatchToProps = dispatch => ({
  get_temps: zip => dispatch(get_temps(zip))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Body);
