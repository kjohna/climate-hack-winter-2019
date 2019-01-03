
import React, { Component } from 'react';
import './WeatherAlerts.css';


const dskey = "f39109d1263aa6b04983e1c34ef1e3df";
const gmapkey = "AIzaSyCd8iUXQ2EfQF-LktLoJzgJ4toV7Q8ZW40";
const zip = "07960";

const simplesky = require("simplesky");
var weather = new simplesky(gmapkey, dskey);


class WeatherAlerts extends Component {
  
  componentDidMount() {
    const getSummary = () => {
      weather.getWeather(zip, null, null, ['alerts', 'flags']).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });
    };
    getSummary();
  }

  render () {

    return (
      <div className="weather-alerts">
        <form action="">

          <h4>This is a Weather Alert! Powered by Dark Sky</h4>

          <p>Light rain tomorrow through Tuesday, with high temperatures bottoming out at 38°F on Monday.</p>
        </form>
      </div>
    );
  }
}

// document.write('')
export default WeatherAlerts;
