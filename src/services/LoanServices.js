import axios from "axios";
const LOAN_API_URL = "http://localhost:4000";

class LoanServices {
  LoginUser(Detail) {
    return axios.post(LOAN_API_URL + "/user-login", Detail);
  }
  CreateUser(Detail) {
    return axios.post(LOAN_API_URL + "/create-user", Detail);
  }
  AddEmiDetails(userId, data, token) {
    return axios.put(LOAN_API_URL + "/loan-emi/" + userId, data, {
      headers: {
        Authorization: token,
      },
    });
  }
  getEmiDetails(userId, token) {
    return axios.get(LOAN_API_URL + "/get-emi-details/" + userId, {
      headers: {
        Authorization: token,
      },
    });
  }
}
export default new LoanServices();
