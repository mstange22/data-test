import axios from "axios";

export default {
  searchBing: (topic, offset) => axios.get(`/images/${topic}/${offset}`),
  getWatchData: () => axios.get('/watch'),
  getActiveAccounts: () => axios.get('/accounts/active'),
  getMediaUploadsData: () => axios.get('/media/uploads'),
  getEmotionData: () => axios.get('/emotion'),
  getSmsData: () => axios.get('/sms'),
};
