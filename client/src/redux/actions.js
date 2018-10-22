import * as types from './constants';

// actions
export function setState(newState) {
  return {
    type: types.SET_STATE,
    payload: {
      newState,
    },
  };
}
