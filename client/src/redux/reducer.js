import initialState from './initialState';
import * as types from './constants';

export default function reducer(state = initialState, action = {}) {
  console.log(action);
  switch (action.type) {
    case types.SET_STATE:
      return { state: action.payload.newState };

    default:
      return state;
  }
}
