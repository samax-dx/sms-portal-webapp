import {createOrUpdateMocked, findListMocked} from "../Util";

const routeStatistics = {
    robi: 40, grameenphone: 30, banglalink: 15, teletalk: 10, others: 5
}

export const RouteReportService = {
    getRouteStatistics: () =>  console.log() || /*axios
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
        Promise.resolve({data: routeStatistics})//senderId.includes(payload.senderId)))
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
