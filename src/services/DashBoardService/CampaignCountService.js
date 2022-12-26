import {CONTACT_BOOK_EP, OFBIZ_EP} from "../../config";
import {XAuth} from "../XAuth";
import axios from "axios";

/*const campaignStatistics = {
    campaignCount: 34, avgSuccessRate: 80, avgFailureRate:20
}*/

export const CampaignCountService = {
    getWeekCampaignCount: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/DashBoard/weekCampaignCount`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        // Promise.resolve({data: campaignStatistics})//senderId.includes(payload.senderId)))
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

    getTodayCampaignCount: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/DashBoard/todayCampaignCount`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        // Promise.resolve({data: campaignStatistics})//senderId.includes(payload.senderId)))
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

    getRtCampaignCount: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/DashBoard/rtCampaignCount`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        // Promise.resolve({data: campaignStatistics})//senderId.includes(payload.senderId)))
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
