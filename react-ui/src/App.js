import React, { Component } from 'react';
import './App.css';
import Header from './components/HeaderComponents/Header';
import Body from './components/BodyComponents/Body';
import Footer from './components/FooterComponents/Footer';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Body />
        <Footer />
      </div>
    );
  }
}

export default App;
