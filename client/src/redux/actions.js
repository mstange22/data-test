import * as types from './constants';

export function setState(newState) {
  return {
    type: types.SET_STATE,
    payload: {
      newState,
    },
  };
}

export const setSearchValue = searchValue => ({
  type: types.SET_SEARCH_VALUE,
  payload: {
    searchValue,
  },
});

export const setAllAccounts = allAccounts => ({
  type: types.SET_ALL_ACCOUNTS,
  payload: {
    allAccounts,
  },
});

export const setActiveAccounts = activeAccounts => ({
  type: types.SET_ACTIVE_ACCOUNTS,
  payload: {
    activeAccounts,
  },
});

export const setCurrentWatcherId = currentWatcherId => ({
  type: types.SET_CURRENT_WATCHER_ID,
  payload: {
    currentWatcherId,
  },
});

export const setCurrentFamilyCode = currentFamilyCode => ({
  type: types.SET_CURRENT_FAMILY_CODE,
  payload: {
    currentFamilyCode,
  },
});

export const setCurrentDeviceId = currentDeviceId => ({
  type: types.SET_CURRENT_DEVICE_ID,
  payload: {
    currentDeviceId,
  },
});

export const setCurrentAccountId = currentAccountId => ({
  type: types.SET_CURRENT_ACCOUNT_ID,
  payload: {
    currentAccountId,
  },
});

export const clearSearch = () => ({
  type: types.CLEAR_SEARCH,
});

export const setMediaUploads = mediaUploads => ({
  type: types.SET_MEDIA_UPLOADS,
  payload: {
    mediaUploads,
  },
});
