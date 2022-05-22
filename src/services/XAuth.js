import axios from "axios";
import { SERVER_URL } from "../config";


const storage = (initialized => {
    const prefix = "xauth_data";
    const auth = {
        token: null
    };

    const setData = data => {
        Object.entries(data).forEach(([k, v]) => {
            if ((auth[k] = v) === null) {
                localStorage.removeItem(`${prefix}__${k}`);
            } else {
                localStorage.setItem(`${prefix}__${k}`, v);
            }
        });
        return data;
    };

    const getData = () => {
        if (!initialized) {
            Object.entries(auth).forEach(([k, v]) => {
                auth[k] = localStorage.getItem(`${prefix}__${k}`);
            });
            initialized = true;
        }
        return auth;
    };

    return data => typeof data === "undefined" ? getData() : setData(data);
})(false);

export const XAuth = {
    login: (ctx, ev) => axios
        .post(
            `${SERVER_URL}/Party/login`,
            { ...ev.data },
            { headers: { 'Content-Type': 'application/json' } }
        )
        .then(response => {
            const { data } = response;

            if (data.token) {
                return Promise.resolve(storage(data));
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        }),
    logout: () => storage({ token: null }),
    token: () => storage().token
};
