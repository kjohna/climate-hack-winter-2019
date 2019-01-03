import React, { Component } from 'react';
import './DateSelector.css';

class DateSelector extends Component {
  render () {
    const type = 'start';

    return (
      <div className="date-selector">
        <form action="">
          <h4>Date</h4>
          <input type="date" name={`${type} date`}></input>
          <input type="submit"></input>
        </form>
      </div>
    );
  }
}

export default DateSelector;