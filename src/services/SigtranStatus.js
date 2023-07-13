import {BL1_Sigtran, CONTACT_BOOK_EP, GP1_Sigtran, GP2_Sigtran, OFBIZ_EP} from "../config";
import axios from "axios";
import {XAuth} from "./XAuth";

export const SigtranStatusService = {
    getGp1Status: (payload) =>  console.log(payload) || axios
        .post(
            `${GP1_Sigtran}`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            const { data }  = response;
            // console.log(data)

            if (data) {
                return Promise.resolve(data);  //
            } else {
                return Promise.reject({ code: null, message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            // console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    getGp2Status: (payload) =>  console.log(payload) || axios
        .post(
            `${GP2_Sigtran}`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            const { data }  = response;
            // console.log(data)

            if (data) {
                return Promise.resolve(data);  //
            } else {
                return Promise.reject({ code: null, message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            // console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    getBL1Status: (payload) =>  console.log(payload) || axios
        .post(
            `${BL1_Sigtran}`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            const { data }  = response;
            console.log(data)

            if (data) {
                return Promise.resolve(data);  //
            } else {
                return Promise.reject({ code: null, message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),

};
