import React, { Component } from 'react';
import './LocationSearch.css';

class LocationSearch extends Component {
  render () {
    const zip = 10001;

    return (
      <div className="location-search">
      <form action="">
          <input className="location-search-input" type="text" value={zip}></input>
        </form>
      </div>
    );
  }
}

export default LocationSearch;