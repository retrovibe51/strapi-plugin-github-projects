// this file was created because it didn't exist
import axios from "axios";
import { auth } from "@strapi/helper-plugin";

const instance = axios.create({
    baseURL: 'http://192.168.1.106:1337/' // process.env.STRAPI_ADMIN_BACKEND_URL
});

instance.interceptors.request.use(
    async (config) => {
        config.headers = {
            Authorization: `Bearer ${auth.get('jwtToken')}`,
            Accept: "application/json",
            "Content-Type": "application/json"
        };

        return config;
    },
    (error) => {
        Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // whatever you want to do with the error
        if(error.response?.status === 401) {
            auth.clearAppStorage();
            window.location.reload();
        }

        throw error;
    }
)
export default instance;