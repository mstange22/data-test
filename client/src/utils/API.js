import axios from "axios";

export default {
  searchBing: (topic, offset) => axios.get(`/images/${topic}/${offset}`),
  getWatchData: () => axios.get('/watch'),
  getActiveWatcherAccounts: () => axios.get('/accounts/watchers'),
  getActiveSmsAccounts: () => axios.get('accounts/sms'),
  getMediaUploadsData: () => axios.get('/media/uploads'),
  getEmotionData: () => axios.get('/emotion'),
  getSmsData: () => axios.get('/sms'),
};
