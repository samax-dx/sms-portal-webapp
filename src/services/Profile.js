import axios from "axios";
import { XAuth } from "./XAuth";

export const Profile = {
    fetchProfile: (ctx, ev) => axios
        .post(
            "https://localhost:8443/ofbiz-spring/api/Party/profile",
            { ...ev.data },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        ).then(response => {
            const { data } = response;

            if (data.profile) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        }).catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        })
};
