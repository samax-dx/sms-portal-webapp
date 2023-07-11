import axios from "axios";
import { OFBIZ_EP } from "../config";
import { XAuth } from "./XAuth";

export const CampaignService = {
    fetchCampaigns: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/listPartyCampaigns`,
            { orderBy: "createdOn DESC", ...payload },
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

            if (data.campaigns) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    fetchCampaignTasks: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/getCampaignTasks`,
            {orderBy: "createdOn DESC", ...payload }, /*JSON.stringify({ ...payload }) || */
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

            if (data.tasks) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    removeCampaignTask: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/deleteCampaignTask`,
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

            if (+data.deleteCount) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    startCampaign: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/startCampaign`,
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

            if (data.schedule) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    startStoppedCampaign: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/startStoppedCampaign`,
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

            if (data.result) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    fetchCampaignTaskReports: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/getPartyCampaignTaskReports`,
            { ...payload, orderBy: "updatedOn DESC" },
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

            if (data.taskReports) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    saveCampaign: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/saveCampaign`,
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

            if (data.campaignId) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    stopCampaign: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/stopCampaign`,
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

            if (data.campaignId) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    deleteCampaign: (payload) => console.log(payload) || axios
        .post(
            `${OFBIZ_EP}/Campaign/deleteCampaign`,
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

            if (+data.deleteCount) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: (typeof data === "string" ? data : data.error) || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        })
};
