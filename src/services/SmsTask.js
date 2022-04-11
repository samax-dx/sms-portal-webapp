import axios from "axios";
import { XAuth } from "./XAuth";

const lastReports = [];
const lastErrors = [];

const sendSms = (ctx, { data }) =>
    axios.post(
        "https://localhost:8443/ofbiz-spring/api/SmsTask/sendSMS",
        { CampaignPackage: "domestic", ...data },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${XAuth.token()}`,
            }
        }
    ).then(response => {
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
    });

export const SmsTask = {
    sendSms,
    lastTaskReports() {
        return [...lastReports];
    },
    lastTaskErrors() {
        return [...lastErrors];
    }
};
