import { assign, createMachine, send, spawn } from "xstate";
import { PartyMachine } from "./PartyMachine";
import { NullMachine } from "./NullMachine";


export const AppMachine = createMachine({
    states: {
        start: {
            entry: send({ type: "NAV_HOME" })
        },
        home: {},
        party: {},
        sendSMS: {},
    },
    on: {
        "NAV_HOME": { target: "home", actions: ["assignHomeActor"] },
        "NAV_PARTY": { target: "party", actions: ["assignPartyActor"] },
        "NAV_SEND_SMS": { target: "sendSMS", actions: ["assignSendSMSActor"] },
    },
    context: {
        actor: null
    },
    initial: "start"
}, {
    actions: {
        assignHomeActor: assign((ctx, ev) => ({
            actor: spawn(NullMachine)
        })),
        assignPartyActor: assign((ctx, ev) => ({
            actor: spawn(PartyMachine)
        })),
        assignSendSMSActor: assign((ctx, ev) => ({
            actor: spawn(NullMachine)
        }))
    }
});
