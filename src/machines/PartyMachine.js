import axios from "axios";
import { assign, createMachine, send, spawn } from "xstate";
import { FetchMachine } from "./FetchMachine";
import { NullMachine } from "./NullMachine";


export const PartyMachine = createMachine({
    states: {
        start: {
            entry: send({ type: "VIEW_LIST" })
        },
        listView: {},
        itemView: {},
    },
    on: {
        "VIEW_LIST": { target: "listView", actions: ["assignListViewActor"] },
        "VIEW_ITEM": { target: "itemView", actions: ["assignItemViewActor"] },
    },
    context: {
        actor: null,
    },
    initial: "start"
}, {
    actions: {
        assignListViewActor: assign((ctx, ev) => {
            const actor = ctx._listViewActor || spawn(FetchMachine.withConfig({
                services: { doFetch: fetchParties }
            }));

            return { actor, _listViewActor: actor };
        }),
        assignItemViewActor: assign((ctx, ev) => {
            const actor = spawn(NullMachine.withContext({
                ...NullMachine.context, party: ev.data
            }));

            return { actor };
        }),
    }
});

const fetchParties = (ctx, { data: searchData }) =>
    axios.post(
        "https://localhost:8443/ofbiz-spring/api/runService",
        {
            method: "performFind",
            params: {
                entityName: "PartyNameView",
                inputFields: Object.assign({
                    groupName: searchData,
                    groupName_op: "contains"
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
