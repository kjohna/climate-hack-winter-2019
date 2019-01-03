import React, { Component } from 'react';
import './Body.css';
import DateSelector from '../DateSelectorComponents/DateSelector';
import LocationSearch from '../LocationSearchComponents/LocationSearch';
import DisplayTemp from '../DisplayTempComponents/DisplayTemp';

class Body extends Component {
  render() {
    return (
      <div className="body">
        <h1>YOUR LOCATION</h1>
        <LocationSearch />
        <p>
          Change your zip and historical date range to compare today's temperature with historical data for the same day on previous years.
        </p>
        <div className="graph-place-holder">
          <p>graph will go here</p>
        </div>
        <DateSelector />
        <LocationSearch />
        <DisplayTemp />
      </div>
    );
  }
}

export default Body;