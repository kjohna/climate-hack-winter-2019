import {
    GET_TEMPS
  } from '../actions';

  export default (temps = {}, action) => {
    switch (action.type) {
      case GET_TEMPS:                    
        return action.payload;
      default:
        return temps;
    }
  };