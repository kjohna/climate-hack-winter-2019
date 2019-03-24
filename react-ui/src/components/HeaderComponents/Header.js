import React, { Component } from 'react';
import './Header.css';
import SettingsMenu from './SettingsMenu';

class Header extends Component {
  render() {
    return (
      <div className="header-container">
        <header className="App-header">
          <div className="">
            <h1>l337 W3thr</h1>
          </div>
          <SettingsMenu />
        </header>
      </div>
    );
  }
}

export default Header;