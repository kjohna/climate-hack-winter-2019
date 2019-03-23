import React, { Component } from 'react';
import './LocationSearch.css';

class LocationSearch extends Component {
  constructor(props){
    super(props)
    this.state = {
      zip: 33143
    }
  }
  handleZip = (e) => {
    this.setState({zip: e.target.value});
  }
  render () {
    // console.log(this.state);

    return (
      <div className="location-search">
      <form action="">
        <input className="location-search-input" onChange={this.handleZip}   type="number" value={this.state.zip} onBlur={this.props.zip(this.state.zip)}></input>
      </form>
      </div>
    );
  }
}

export default LocationSearch;