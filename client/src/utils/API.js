import axios from "axios";

export default {
  searchBing: (topic, offset) => axios.get(`/images/${topic}/${offset}`),
  getWatchData: () => axios.get('/watch'),
  getAllAccounts: () => axios.get('accounts/all'),
  getActiveWatcherAccounts: () => axios.get('/accounts/watchers'),
  getActiveSmsAccounts: () => axios.get('accounts/sms'),
  getMediaUploads: () => axios.get('/media/uploads'),
  getMediaUploadsByBucket: () => axios.get('/media/buckets'),
  getEmotionData: () => axios.get('/emotion'),
  getSmsData: () => axios.get('/sms'),
  getDeviceData: () => axios.get('device'),
  getMusicData: () => axios.get('music'),
};
