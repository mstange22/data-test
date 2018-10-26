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

export const setAllAccounts = (allAccounts) => ({
  type: types.SET_ALL_ACCOUNTS,
  payload: {
    allAccounts,
  },
});

export const setActiveAccounts = (activeAccounts) => ({
  type: types.SET_ACTIVE_ACCOUNTS,
  payload: {
    activeAccounts,
  },
});
