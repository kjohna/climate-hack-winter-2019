/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import './WeatherAlerts.css';
import { connect } from "react-redux"

class WeatherAlerts extends Component {
  // *** Commented out for non-use -Kenny
  // ***********************************************
  // componentDidMount() {
  //   const getSummary = () => {
  //     weather.getWeather("zip", null, null, ['alerts', 'flags']).then((response) => {
  //       console.log(response);
  //   }).catch((error) => {
  //       console.log(error);
  //   });
  //   };
  //   getSummary();
  // }
  // *************************************************

  render() {
    return (
      <div className="weather-alerts">
        <form action="">
          {this.props.alert !== 'None' ? (
            <view style={{ flex: 1 }}>
              <h4>This is a Weather Alert! </h4>
              <br/>
              <text>{this.props.alert}</text>
            </view>
          ) :
            (<h5>No Alerts</h5>)}
        </form>
      </div>
    );
  }
}


const mapStateToProps = state => ({
  alert: state.temps.alert || "Light rain tomorrow through Tuesday, with high temperatures bottoming out at 68°F on Monday."
});
const mapDispatchToProps = dispatch => ({
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WeatherAlerts)

