import * as constants from './constants';

export default function(state = [], action) {
  switch(action.type){
    case constants.CRABIFY: 
      return action.payload;
    default: return state;
  }
}