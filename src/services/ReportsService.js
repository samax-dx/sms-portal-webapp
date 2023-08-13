import axios from "axios";
import {CONTACT_BOOK_EP, SERVER_URL} from "../config";
import { XAuth } from "./XAuth";

export const ReportsService = {
    fetchRecords: (payload) => console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/client/reports/campaignRouteAndPartyWiseReports`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            let { data } = response;
            console.log(data)

            if (data === null) {
                data = [];
            }
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
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    findAllCampaignForDropdown: (payload) => console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/client/Dropdown/AllClientCampaignForDropdown`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            let { data } = response;
            console.log(data)

            if (data === null) {
                data = [];
            }
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
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    findAllRouteForDropdown: (payload) => console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/client/Dropdown/AllClientRoutesForDropdown`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            let { data } = response;
            console.log(data)

            if (data === null) {
                data = [];
            }
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
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    findAllPartyForDropdown: (payload) => console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/admin/Dropdown/AllPartyForDropdown`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        .then(response => {
            let { data } = response;
            console.log(data)

            if (data === null) {
                data = [];
            }
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
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
};
