import { CRABIFY } from '.actions';

export default function(state = [], action) {
  switch(action.type){
    case CRABIFY: 
      return action.payload;
    default: return state;
  }
}