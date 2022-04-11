import axios from "axios";
import { XAuth } from "./XAuth";

export const Accounting = ({
    fetchBalanceRequests: (ctx, ev) => axios
        .post(
            "https://localhost:8443/ofbiz-spring/api/Accounting/listPartyBalanceRequests",
            { ...ev.data },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        ).then(response => {
            const { data } = response;

            if (data.payments === null) {
                data.payments = [];
            }

            if (data.payments) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        }).catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        }),
    requestDeposit: (ctx, ev) => axios
        .post(
            "https://localhost:8443/ofbiz-spring/api/Accounting/addPartyBalanceRequest",
            { ...ev.data },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        ).then(response => {
            const { data } = response;

            if (data.paymentId) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        }).catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        }),
});
