import * as types from './constants';

export function setState(newState) {
  return {
    type: types.SET_STATE,
    payload: {
      newState,
    },
  };
}

export const setSearchValue = (searchValue) => ({
  type: types.SET_SEARCH_VALUE,
  payload: {
    searchValue,
  },
});
