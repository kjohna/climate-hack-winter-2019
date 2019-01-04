import React, { Component } from 'react';
import './LocationSearch.css';

class LocationSearch extends Component {
  // constructor(props){
  //   super(props);
  //   this.state.setState({zip : 87106});
  // }

  render () {
    // console.log(this.state);
    let zip = 33143;

    return (
      <div className="location-search">
      <form action="">
        <input className="location-search-input" type="text" defaultValue="ZIP CODE" value={zip} onBlur={this.props.zip(zip)}></input>
      </form>
      </div>
    );
  }
}

export default LocationSearch;