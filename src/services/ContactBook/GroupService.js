import {createOrUpdateMocked} from "../../Util";
import {deleteOneMocked} from "../../Util";

const groups = [
    { groupId: "101", partyId: "1001", groupName: "Football Team" },
    { groupId: "102", partyId: "1002", groupName: "Fakir" },
    { groupId: "103", partyId: "1003", groupName: "Developer" },
];

export const GroupService = {
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
        Promise.resolve({ groups: groups.filter(group => group.groupName.includes(payload.groupName || "")), count: groups.length })
            .then(response => {
                const  data  = response;
                console.log(data)

                if (data.groups === null) {
                    data.groups = [];
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
        )*/createOrUpdateMocked(groups, "groupId", payload).then(record => ({ data: record }))
        .then(response => {
            const { data } = response;
            console.log(data)

            if (data.groupId) {
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
        )*/deleteOneMocked(groups, "groupId", payload).then(record => ({ data: record }))
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
