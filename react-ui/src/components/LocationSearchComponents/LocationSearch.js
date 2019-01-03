import React, { Component } from 'react';
import './LocationSearch.css';

class LocationSearch extends Component {
  render () {
    const zip = 10001;

    return (
      <div className="location-search">
        <form action="">
          <input type="text" value={zip}></input> (zip code)
        </form>
      </div>
    );
  }
}

export default LocationSearch;