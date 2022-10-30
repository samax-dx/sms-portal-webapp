import {contactBookContacts, contactBookGroups} from "./ContactBookDB";
import {findListMocked} from "../../Util";
import {CONTACT_BOOK_EP} from "../../config";
import axios from "axios";
import {XAuth} from "../XAuth";

const contacts = contactBookContacts;
const groups = contactBookGroups;

export const ContactBookService = {
    fetchGroupRecords: (payload) =>  console.log(payload) || axios
        .post(
            `${CONTACT_BOOK_EP}/ContactGroup/listContactGroupContacts`,
            { ...payload },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${XAuth.token()}`,
                }
            }
        )
        // Promise.resolve({ group: contactBookGroups.find(g => g.groupId == payload.groupId), ...findListMocked(contactBookContacts, payload, "groupId", "contacts") })
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
};