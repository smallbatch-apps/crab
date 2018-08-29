import * as constants from './constants';

export default function(state = [], action) {
  switch(action.type){
    case constants.ACTION_CRABIFY: 
      return action.payload;
    default: return state;
  }
}