import React, { Component } from 'react';
import './App.css';
import Header from './components/HeaderComponents/Header';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: null,
      fetching: true,
    };
  }  
  componentDidMount() {
    fetch('/')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        this.setState({
          message: json.message,
          fetching: false,
        });
      })
      .catch((e) => {
        this.setState({
          message: `API call failed: ${e}`,
          fetching: false,
        });
      });
  }  
  render() {
    return (
      <div className="App">
        <Header />
      </div>
    );
  }
}

export default App;
