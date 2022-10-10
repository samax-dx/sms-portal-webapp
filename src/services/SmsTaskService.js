import axios from "axios";
import { SERVER_URL } from "../config";
import { XAuth } from "./XAuth";


export const SmsTaskService = {
    sendSms: (payload) => console.log(payload) || axios
        .post(
            `${SERVER_URL}/SmsTask/sendSMS`,
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
            console.log(data)

            if (data.report) {
                return Promise.resolve(data.report);
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
