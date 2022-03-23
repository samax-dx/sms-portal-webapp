import axios from "axios";
import { assign, createMachine, send, spawn } from "xstate";
import { EditorMachine } from "./EditorMachine";
import { FetchMachine } from "./FetchMachine";
import { NullMachine } from "./NullMachine";


export const OrderMachine = createMachine({
    states: {
        start: {
            entry: send({ type: "VIEW_LIST" })
        },
        listView: {},
        itemView: {},
        itemEdit: {},
        itemAdd: {},
    },
    on: {
        "VIEW_LIST": { target: "listView", actions: ["assignListViewActor"] },
        "VIEW_ITEM": { target: "itemView", actions: ["assignItemViewActor"] },
        "EDIT_ITEM": { target: "itemEdit", actions: ["assignItemEditActor"] },
        "ADD_ITEM": { target: "itemAdd", actions: ["assignItemAddActor"] },
    },
    context: {
        actor: null,
    },
    initial: "start"
}, {
    actions: {
        assignListViewActor: assign((ctx, ev) => {
            const actor = ctx._listViewActor || spawn(FetchMachine.withConfig({
                services: { doFetch: fetchOrders }
            }));

            return { actor, _listViewActor: actor };
        }),
        assignItemViewActor: assign((ctx, ev) => {
            const actor = spawn(NullMachine.withContext({
                ...NullMachine.context, order: ev.data
            }));

            return { actor };
        }),
        assignItemEditActor: assign((ctx, ev) => {
            const actor = [
                spawn(EditorMachine.withContext({
                    ...EditorMachine.context, record: ev.data
                })),
                spawn(FetchMachine.withConfig({
                    services: { doFetch: createOrder }
                })),
            ];

            return { actor };
        }),
        assignItemAddActor: assign((ctx, ev) => {
            const actor = [
                spawn(EditorMachine.withContext({
                    ...EditorMachine.context, record: {}
                })),
                spawn(FetchMachine.withConfig({
                    services: { doFetch: createOrder }
                })),
            ];

            return { actor };
        }),
    }
});

const fetchOrders = (ctx, { data: searchData }) =>
    axios.post(
        "https://localhost:8443/ofbiz-spring/api/runService",
        {
            method: "performFind",
            params: {
                entityName: "OrderHeader",
                inputFields: Object.assign({
                    orderTypeId: "SALES_ORDER",
                    statusId: "ORDER_COMPLETED"
                }, searchData)
            }
        },
        {
            headers: { 'Content-Type': 'application/json' }
        }
    ).then(response => {
        const { result, error = null } = response.data;
        return error ? Promise.reject(error) : result && result.listIt;
    }).catch(error => {
        const response = error.response || { data: { error: error.message } };
        const { status: code, statusText: text, data } = response;
        return Promise.reject({ code, message: data.error || text });
    });

const createOrder = (ctx, { data: order }) =>
    axios.post(
        "https://localhost:8443/ofbiz-spring/api/runService",
        {
            "method": "spCreateOrder",
            "params": Object.assign({
                "orderMode": "SALES_ORDER",
                "productStoreId": "9000",
                "userLoginId": "admin",
                "partyId": "SmsPortalCustomer4",

                "hasAgreements": "N",
                "orderName": "SMS Bundle 65WRT",
                "currencyUomId": "USD",
                "CURRENT_CATALOG_ID": "DemoCatalog",

                "add_product_id": "SmsBundle500",
                "quantity": "15",

                "checkoutpage": "quick",
                "BACK_PAGE": "quickcheckout",
                "shipToCustomerPartyId": "SmsPortalCustomer4",
                "shipping_method": "NO_SHIPPING@_NA_",
                "may_split": "false",
                "is_gift": "false",
                "billingAccountId": "10014"
            }, order)
        },
        {
            headers: { 'Content-Type': 'application/json' }
        }
    ).then(response => {
        const { result, error = null } = response.data;
        return error ? Promise.reject(error) : result;
    }).catch(error => {
        const response = error.response || { data: { error: error.message } };
        const { status: code, statusText: text, data } = response;
        return Promise.reject({ code, message: data.error || text });
    });
