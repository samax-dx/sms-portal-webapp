import axios from "axios";

export const XAuth = (storage => ({
    login: params => axios
        .post(
            "https://localhost:8443/ofbiz-spring/api/Party/login",
            { ...params },
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
