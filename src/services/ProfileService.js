import axios from "axios";
import { SERVER_URL } from "../config";
import { XAuth } from "./XAuth";

export const ProfileService = {
    fetchProfile: (payload) => console.log() || axios
        .post(
            `${SERVER_URL}/Party/profile`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            const { data } = response;
            console.log(data);

            if (data.profile) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: data.error || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        })
};
