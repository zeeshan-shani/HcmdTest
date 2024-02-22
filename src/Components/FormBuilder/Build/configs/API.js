import axios from "axios";

export const baseURL = "http://192.168.18.123:3030/";

export const baseAPI = axios.create({
  baseURL: baseURL + "/api",
});

baseAPI.interceptors.request.use(
  async (req) => {
    let token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQG5hcm9sYS5lbWFpbCIsIl9pZCI6IjYzOTgwNTU1MjAyZjBhY2QxNDkzOWU2NSIsInR5cGUiOjEsImlhdCI6MTY3NzQ3NDQzNSwiZXhwIjoxNjc3NTAzMjM1fQ.sLIe4dG3EzRvMttG1tbrfARfG51577IrPgN2TjpJ_Nk";
    // let token = localStorage.getItem("token")
    //   ? localStorage.getItem("token")
    //   : null;
    // if (token !== null) {

    if (req.headers?.useBaseAPI === false) {
      req.baseURL = req.url;
      req.url = "/";
    }
    req.headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": !!req.multipartForm
        ? "multipart/form-data"
        : "application/json",
    };
    // }
    delete req.multipartForm;
    delete req.headers?.useBaseAPI;
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// baseAPI.interceptors.response.use(undefined, function axiosLogout(err) {
//   if (err.response?.status === 401) {
//     toast.error("Token Expired!", {
//       toastId: "token_error",
//     });
//     dispatch(logout());
//   } else {
//     return Promise.reject(err);
//   }
// });
