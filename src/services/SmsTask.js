import axios from "axios";
import { SERVER_URL } from "../config";
import { XAuth } from "./XAuth";


export const SmsTask = {
    sendSms: (ctx, { data }) => axios
        .post(
            `${SERVER_URL}/SmsTask/sendSMS`,
            { ...data },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            const { data } = response;

            if (data.report) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        }),
    lastTaskReports: () => {
        return [];
    },
    lastTaskErrors: () => {
        return [];
    }
};
