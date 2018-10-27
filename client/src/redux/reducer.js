import initialState from './initialState';
import * as types from './constants';

export default function reducer(state = initialState, action = {}) {
  console.log(action);
  switch (action.type) {
    case types.SET_STATE:
      return { state: action.payload.newState };
    case types.SET_SEARCH_VALUE:
      return { ...state, searchValue: action.payload.searchValue };
    case types.SET_ALL_ACCOUNTS:
      return { ...state, allAccounts: action.payload.allAccounts };
    case types.SET_ACTIVE_ACCOUNTS:
      return { ...state, activeAccounts: action.payload.activeAccounts };
    case types.SET_CURRENT_WATCHER_ID:
      return { ...state, currentWatcherId: action.payload.currentWatcherId };
    case types.SET_CURRENT_FAMILY_CODE:
      return { ...state, currentFamilyCode: action.payload.currentFamilyCode };
    default:
      return state;
  }
}
