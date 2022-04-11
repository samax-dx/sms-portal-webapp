import { assign, createMachine, send, spawn } from "xstate";

import { NullMachine } from "./NullMachine";
import { FetchMachine } from "./FetchMachine";
import { LoginMachine } from "./LoginMachine";
import { LogoutMachine } from "./LogoutMachine";

import { SmsTask } from "../services/SmsTask";
import { Accounting } from "../services/Accounting";
import { Profile } from "../services/Profile";


export const AppMachine = createMachine({
    id: "app",
    states: {
        start: {
            entry: ["assingProfileActor", send({ type: "LOGIN" })]
        },
        home: {},
        sendSMS: {},
        smsReport: {},
        cashDeposit: {},
        login: {},
        logout: {},
    },
    on: {
        "NAV_HOME": { target: "home", actions: ["assignHomeActor"] },
        "NAV_SEND_SMS": { target: "sendSMS", actions: ["assignSendSmsActor"] },
        "NAV_SMS_REPORT": { target: "smsReport", actions: ["assignSmsReportActor"] },
        "NAV_CASH_DEPOSIT": { target: "cashDeposit", actions: ["assignCashDepositActor"] },
        "LOGIN": { target: "login", actions: ["assignLoginActor"] },
        "LOGOUT": { target: "logout", actions: ["assignLogoutActor"] },
    },
    context: {
        actor: null,
        profileActor: null
    },
    initial: "start"
}, {
    actions: {
        assingProfileActor: assign((ctx, ev) => ({
            profileActor: spawn(FetchMachine.withConfig({
                services: { doFetch: Profile.fetchProfile }
            }))
        })),
        assignHomeActor: assign((ctx, ev) => ({
            actor: spawn(NullMachine)
        })),
        assignSendSmsActor: assign((ctx, ev) => {
            const actor = spawn(FetchMachine.withConfig(
                {
                    services: { doFetch: SmsTask.sendSms }
                }
            ));
            return { actor };
        }),
        assignSmsReportActor: assign((ctx, ev) => {
            const actor = spawn(NullMachine);
            return { actor };
        }),
        assignCashDepositActor: assign((ctx, ev) => {
            const actor = [
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Accounting.fetchBalanceRequests }
                    },
                    {
                        payload: { data: { page: 1, limit: 10 } },
                        error: { message: "Waiting for Deposit Search" }
                    }
                )),
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Accounting.requestDeposit }
                    }
                )),
                ctx.profileActor
            ];
            return { actor };
        }),
        assignLoginActor: assign((ctx, ev) => ({
            actor: spawn(LoginMachine)
        })),
        assignLogoutActor: assign((ctx, ev) => ({
            actor: spawn(LogoutMachine)
        })),
    }
});
