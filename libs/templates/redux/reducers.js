import {combineReducers} from 'redux';

import CrabReducer from './reducer_crab';

const rootReducer = combineReducers({
  crabs: CrabReducer
});

export default rootReducer;