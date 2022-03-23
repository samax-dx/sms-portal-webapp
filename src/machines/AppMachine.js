import { assign, createMachine, send, spawn } from "xstate";
import { PartyMachine } from "./PartyMachine";
import { NullMachine } from "./NullMachine";
import { LoginMachine } from "./LoginMachine";
import { LogoutMachine } from "./LogoutMachine";


export const AppMachine = createMachine({
    states: {
        start: {
            entry: send({ type: "LOGIN" })
        },
        home: {},
        party: {},
        sendSMS: {},
        login: {},
        logout: {},
    },
    on: {
        "NAV_HOME": { target: "home", actions: ["assignHomeActor"] },
        "NAV_PARTY": { target: "party", actions: ["assignPartyActor"] },
        "NAV_SEND_SMS": { target: "sendSMS", actions: ["assignSendSMSActor"] },
        "LOGIN": { target: "login", actions: ["assignLoginActor"] },
        "LOGOUT": { target: "logout", actions: ["assignLogoutActor"] },
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
        })),
        assignLoginActor: assign((ctx, ev) => ({
            actor: spawn(LoginMachine)
        })),
        assignLogoutActor: assign((ctx, ev) => ({
            actor: spawn(LogoutMachine)
        })),
    }
});
