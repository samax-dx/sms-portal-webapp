import {createOrUpdateMocked, createOrUpdateMockedMulti, findListMocked} from "../../Util";
import {deleteOneMocked} from "../../Util";
import {contactBookContacts} from "./ContactBookDB";
import {CONTACT_BOOK_EP} from "../../config";
import axios from "axios";
import {XAuth} from "../XAuth";

const contacts = contactBookContacts;

export const ContactService = {
    fetchRecords: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/Contact/listContacts`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        // Promise.resolve(findListMocked(contacts, payload, "contactName", "contacts"))
        .then(response => {
            const {data}  = response;
            console.log(data)

           if (data.contacts === null) {
                data.contacts = [];
            }

            if (data) {
                return Promise.resolve(data);  //
            } else {
                return Promise.reject({ code: null, message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: data.error || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    saveRecord: (payload) => console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/Contact/saveContact`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
    // createOrUpdateMocked(contacts, "contactId", payload).then(({ record }) => ({ data: record }))
        .then(response => {
            const { data } = response;
            console.log(data)

            if (data.contactId) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ code: null, message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: data.error || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    saveRecords: (payload) => console.log(payload) || /*axios
        .post(
            `${SERVER_URL}/ContactBook/saveContact`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )*/createOrUpdateMockedMulti(contacts, "contactId", payload).then(({ records }) => ({ data: records }))
        .then(response => {
            const { data } = response;
            console.log(data)

            if (data.length>0) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ code: null, message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: data.error || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        }),
    removeRecord: (payload) => console.log(payload) || /*axios
        .post(
            `${SERVER_URL}/ContactBook/removeContact`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )*/deleteOneMocked(contacts, "contactId", payload).then(record => ({ data: record }))
        .then(response => {
            const { data } = response;
            console.log(data)

            if (data.deleteCount) {
                return Promise.resolve(data);
            } else {
                return Promise.reject({ code: null, message: data.errorMessage });
            }
        })
        .catch(error => {
            const response = error.response || { data: { error: error.message } };
            const { status: code, statusText: text, data } = response;
            const errorEx = { code, message: data.error || text };
            console.log(errorEx);

            return Promise.reject(errorEx);
        })
};
