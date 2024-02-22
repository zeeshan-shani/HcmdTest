// import { useState } from "react";

// const useAxios = ({ url = "", type = "GET" }) => {
//     const [isLoading, setIsLoading] = useState();
//     const [responseData, setResponse] = useState();
//     async function requestAPI(payload = "", headers) {
//         setIsLoading(true);
//         const { data } = await AxiosRequestHandler({ type, url, payload, headers }, () => setIsLoading(false));
//         setIsLoading(false);
//         setResponse(data);
//     }
//     return { isLoading, data: responseData, requestAPI };
// };

// const AxiosRequestHandler = async ({ type, url, payload = "", headers = "" }, callback) => {
//     switch (type) {
//         case "GET":
//             try {
//                 return await .get(url, headers);
//             } catch (error) {
//                 return AxiosErrorHandler(error, callback);
//             }
//         case "POST":
//             try {
//                 return await .post(url, payload, headers);
//             } catch (error) {
//                 return AxiosErrorHandler(error, callback);
//             }
//         case "DELETE":
//             try {
//                 return await .delete(url, { headers, payload });
//             } catch (error) {
//                 return AxiosErrorHandler(error, callback);
//             }
//         case "PUT":
//             try {
//                 return await .put(url, payload, headers);
//             } catch (error) {
//                 return AxiosErrorHandler(error, callback);
//             }
//         default: return null;
//     }
// };

// const AxiosErrorHandler = (error, callback) => {
//     callback();
//     if (error.response) {
//         /*
//          * The request was made and the server responded with a
//          * status code that falls out of the range of 2xx
//          */
//         // ("Error: server response");
//         return error.response;
//     } else if (error.request) {
//         /*
//         * The request was made but no response was received, `error.request`part
//         * is an instance of XMLHttpRequest in the browser and an instance
//         * of http.ClientRequest in Node.js
//         */
//         // ("Error: No response");
//         let error = { response: 500 };
//         return error;
//     } else {
//         // Something happened in setting up the request and triggered an Error
//         // ("Error: Requesting");
//         let error = { response: 500 };
//         return error;
//     }
// };
// export default useAxios;
