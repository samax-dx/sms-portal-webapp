import axios from "axios";
import { OFBIZ_EP } from "../config";
import { XAuth } from "./XAuth";

export const RatePlanService = {
    fetchRatePlan: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/RatePlan/getClientRatePlans`,
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
            // console.log(data)

            if (data) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            // console.log(errorEx);

            return Promise.reject(errorEx);
        })
};
