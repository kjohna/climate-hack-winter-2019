import React, { Component } from 'react';
import './WeatherAlerts.css';

class LocationSearch extends Component {
  render () {
    const zip = 10001;

    return (
      <div className="Weather Alerts">
        <form action="">
          <h4>This is a Weather Alert!</h4>
          <input type="text" ></input>
        </form>
      </div>
    );
  }
}

export default WeatherAlerts;