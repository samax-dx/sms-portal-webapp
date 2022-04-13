import axios from "axios";
import { XAuth } from "./XAuth";

export const Order = {
    fetchOrders: (ctx, ev) => axios
        .post(
            "https://localhost:8443/ofbiz-spring/api/Order/listPartyOrders",
            { ...ev.data },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        ).then(response => {
            const { data } = response;

            if (data.orders) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        }).catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        }),
    createOrder: (ctx, ev) => axios
        .post(
            "https://localhost:8443/ofbiz-spring/api/Order/createPartyOrder",
            { ...ev.data },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        ).then(response => {
            const { data } = response;

            if (data.orderId) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        }).catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            return Promise.reject({ code, message: data.error || text });
        }),
};
