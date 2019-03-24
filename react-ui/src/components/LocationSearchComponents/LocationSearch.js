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
    this.setState({zip: e.target.value},
      () => this.props.zip(this.state.zip) );
  }
  handleSubmit = (e) => {
    e.preventDefault();
    // console.log('preventDefault')
    this.props.zip(this.state.zip)
  }
  handleBlur = (e) => {
    this.props.zip(this.state.zip)
  }
  render () {
    // console.log(this.state);

    return (
      <div className="location-search">
      <form action="" onSubmit={this.handleSubmit}>
        <input className="location-search-input" onChange={this.handleZip} type="number" value={this.state.zip}  onBlur={this.handleBlur}>
        </input>
      </form>
      </div>
    );
  }
}

export default LocationSearch;