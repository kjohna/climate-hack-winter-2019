import React, { Component } from 'react';
import './App.css';
import Header from './components/HeaderComponents/Header';
import Body from './components/BodyComponents/Body'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Body />
      </div>
    );
  }
}

export default App;
