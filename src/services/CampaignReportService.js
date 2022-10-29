import {createOrUpdateMocked, findListMocked} from "../Util";

const campaignStatistics = {
    campaignCount: 34, avgSuccessRate: 80, avgFailureRate:20
}
// const smsStatistics = {
//     smsCount: 200, avgSentRate: 75, avgUnsentRate: 25
// }



export const CampaignReportService = {
    getCampaignStatistics: () =>  console.log() || /*axios
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
        Promise.resolve({data: campaignStatistics})//senderId.includes(payload.senderId)))
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
                const errorEx = { code, message: data.error || text };
                console.log(errorEx);

                return Promise.reject(errorEx);
            }),

};
