import React, { Component } from 'react';
import './LocationSearch.css';

class LocationSearch extends Component {
  render () {
    const zip = 10001;

    return (
      <div className="location-search">
      <h1>YOUR LOCATION</h1>
        <p>
          Change your zip and historical date range to compare today's temperature with historical data for the same day on previous years.
        </p>
        <form action="">
          <input type="text" value={zip}></input> (zip code)
        </form>
      </div>
    );
  }
}

export default LocationSearch;