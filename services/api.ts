import axios from "axios";

// http://192.168.1.165:3333 /create
export const api = axios.create({
  baseURL: "https://api-mobiledieta.onrender.com/api",
});
