import {createOrUpdateMocked} from "../../Util";
import {deleteOneMocked} from "../../Util";

const contacts = [
    { contactId: "101", groupId: "101", contactName: "Shabbir Ahmed", contactNumber: "01717590703" },
    { contactId: "102", groupId: "102", contactName: "Mustafa Rahman", contactNumber: "0182947393" },
    { contactId: "103", groupId: "103", contactName: "Grad Mon", contactNumber: "03947264837" },
    { contactId: "104", groupId: "101", contactName: "Yent Sie", contactNumber: "01836982733" },
    { contactId: "105", groupId: "102", contactName: "Gery Nikol", contactNumber: "04833973937" },
    { contactId: "106", groupId: "103", contactName: "Fez humer", contactNumber: "04826382424" },
    { contactId: "107", groupId: "101", contactName: "Nub garet", contactNumber: "90183783782" },
];

export const SenderIdService = {
    fetchRecords: (payload) =>  console.log(payload) || /*axios
        .post(
            `${SERVER_URL}/Party/findParties`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )*/
        Promise.resolve({ contacts: contacts.filter(contact => contact.contactName.includes(payload.contactName || "")), count: contacts.length })
        .then(response => {
            const  data  = response;
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
    saveRecord: (payload) => console.log(payload) || /*axios
        .post(
            `${SERVER_URL}/ContactBook/saveContact`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )*/createOrUpdateMocked(contacts, "contactId", payload).then(record => ({ data: record }))
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
