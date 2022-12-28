import {CONTACT_BOOK_EP} from "../../config";
import {XAuth} from "../XAuth";
import axios from "axios";

/*const campaignStatistics = {
    campaignCount: 34, avgSuccessRate: 80, avgFailureRate:20
}*/

export const CampaignTaskCountService = {
    getWeekCampaignTaskCount: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/client/DashBoard/weekTotalTaskCount`,
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

    getTodayCampaignTaskCount: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/client/DashBoard/todayTotalTaskCount`,
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

    getRtCampaignTaskCount: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/client/DashBoard/rtTotalTaskCount`,
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
