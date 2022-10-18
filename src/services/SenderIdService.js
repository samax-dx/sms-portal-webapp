import {createOrUpdateMocked, findListMocked} from "../Util";

const senderIds = [
    { senderIdId: "111", senderId: "8801717590383", type: "non-masking", parties: null, routes: "banglalink,grameenphone" },
    { senderIdId: "222", senderId: "8801887590323", type: "non-masking", parties: null, routes: "robi,grameenphone" },
    { senderIdId: "333", senderId: "Pran Muri", type: "masking", parties: "10040", routes: "grameenphone" },
    { senderIdId: "444", senderId: "Cosco Saban", type: "masking", parties: "10040", routes: "teletalk,grameenphone" },
    { senderIdId: "555", senderId: "Pocha Saban", type: "masking", parties: "10212", routes: "grameenphone" },
    { senderIdId: "666", senderId: "Telcobright", type: "masking", parties: "", routes: "banglalink" },
    { senderIdId: "777", senderId: "8801783590629", type: "non-masking", parties: "", routes: "banglalink,grameenphone" },
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
        Promise.resolve(findListMocked(senderIds, payload, "senderId", "senderIds"))//senderId.includes(payload.senderId)))
        .then(response => {
            const  data  = response;
            console.log(data)

           if (data.senderIds === null) {
                data.senderIds = [];
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
        })
};
