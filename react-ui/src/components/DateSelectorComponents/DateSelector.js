import React, { Component } from 'react';
import './DateSelector.css';
import DateChoice from './DateChoice';

class DateSelector extends Component {
  render () {
    return (
      <div className="date-selector">
        <div className="start-date">
          <DateChoice type="Start" />
        </div>
        <div className="stop-date">
          <DateChoice type="Stop" />
        </div>
      </div>
    );
  }
}

export default DateSelector;