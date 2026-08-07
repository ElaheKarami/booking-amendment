import axios from "axios";
import { applyInterceptors } from "./interceptors";

const clientAxios = applyInterceptors(
  axios.create({
    baseURL: "/api",
    withCredentials: true,
  }),
);

export default clientAxios;
