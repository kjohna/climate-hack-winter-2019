import React, { Component } from 'react';
import './Header.css';
import gearIcon from '../../img/settings-gear.svg';

class SettingsMenu extends Component {
  render () {
    return (
      <div className="settings-menu">
        <img src={gearIcon} className="settings-menu-icon" alt="Settings" />
      </div>
    );
  }
}

export default SettingsMenu;