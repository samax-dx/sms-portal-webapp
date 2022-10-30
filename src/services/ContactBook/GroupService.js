import {createOrUpdateMocked, findListMocked} from "../../Util";
import {deleteOneMocked} from "../../Util";
// import {contactBookGroups} from "./ContactBookDB";
import axios from "axios";
import {CONTACT_BOOK_EP, OFBIZ_EP} from "../../config";
import {XAuth} from "../XAuth";
import {contactBookGroups} from "./ContactBookDB";

const groups =contactBookGroups;

export const GroupService = {
    fetchRecords: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/ContactGroup/listContactGroups`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        // Promise.resolve(findListMocked(groups, payload, "groupName", "groups"))
            .then(response => {
                const {data}  = response;
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
    saveRecord: (payload) => console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/ContactGroup/saveContactGroup`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        // createOrUpdateMocked(groups, "groupId", payload).then(({ record }) => ({ data: record }))
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
