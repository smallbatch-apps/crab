/*
* You can put your actions here in this file, or break them up across
* multiple files. Redux patterns are very... flexible. This is just one
* possible approach.
* 
* You should obviously replace this action with some of your own that actually
* do useful things.
* 
* For more information please see the Redux Actions Documentation
* https://redux.js.org/basics/actions
*/

export const CRABIFY = 'CRABIFY';

export const crabify = (value) => {
  return {
    type: CRABIFY,
    payload: `🦀${value}🦀`
  }
}