import axios from "axios";
import { SERVER_URL } from "../config";
import { XAuth } from "./XAuth";

const lastReports = [];
const lastErrors = [];

const sendSms = (ctx, { data }) =>
    axios.post(
        `${SERVER_URL}/SmsTask/sendSMS`,
        { ...data },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${XAuth.token()}`,
            }
        }
    ).then(response => {
        const { data } = response;

        if (data.reports) {
            return Promise.resolve(data);
        } else {
            return Promise.reject({ message: data.errorMessage });
        }
    }).catch(error => {
        const response = error.response || { data: { error: error.message } };
        const { status: code, statusText: text, data } = response;
        return Promise.reject({ code, message: data.error || text });
    })/*.then(response => {
        const { data } = response;

        if (data.reports) {
            Object.assign(lastReports, data.reports);
            lastErrors.splice(0);

            return Promise.resolve([...lastReports]);
        } else {
            return Promise.reject({ message: data.errorMessage });
        }
    }).catch(error => {
        const response = error.response || { data: { error: error.message } };
        const { status: code, statusText: text, data } = response;

        Object.assign(lastErrors, [{ message: [data.error || text] }]);
        lastReports.splice(0);

        return Promise.reject({ code, message: data.error || text });
    })*/;

export const SmsTask = {
    sendSms: (...args) => console.log(...args) || sendSms(...args),
    lastTaskReports() {
        return [...lastReports];
    },
    lastTaskErrors() {
        return [...lastErrors];
    }
};
