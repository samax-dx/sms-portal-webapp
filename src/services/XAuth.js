import axios from "axios";
import { SERVER_URL } from "../config";

export const XAuth = (storage => ({
    login: (ctx, ev) => axios
        .post(
            `${SERVER_URL}/Party/login`,
            { ...ev.data },
            { headers: { 'Content-Type': 'application/json' } }
        ).then(response => {
            const { data } = response;

            if (data.token) {
                return Promise.resolve(Object.assign(storage, data));
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        }).catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        }),
    logout: () => storage.token = null,
    token: () => storage.token
}))({ token: null });
