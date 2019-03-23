/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import './WeatherAlerts.css';

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

  render () {

    return (
      <div className="weather-alerts">
        <form action="">

          <h4>This is a Weather Alert! </h4>

          <p>Light rain tomorrow through Tuesday, with high temperatures bottoming out at 68°F on Monday.</p>
        </form>
      </div>
    );
  }
}

// document.write('')
export default WeatherAlerts;
