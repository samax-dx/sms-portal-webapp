import axios from "axios";
import { OFBIZ_EP } from "../config";
import { XAuth } from "./XAuth";

export const AccountingNew = ({
    fetchBalanceRequests: (payload) =>console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Accounting/listPartyBalanceRequests`,
            { ...payload},
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

            if (data.payments === null) {
                data.payments = [];
            }

            if (data.payments) {
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
        }),
    requestDeposit: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Accounting/addPartyBalanceRequest`,
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

            if (data.paymentId) {
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
});
