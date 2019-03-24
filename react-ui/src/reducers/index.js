import { combineReducers } from 'redux';
import temperatureReducer from './temperature';
const rootReducer = combineReducers({temps: temperatureReducer})

export default rootReducer;