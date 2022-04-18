import { assign, createMachine, send, spawn } from "xstate";

import { NullMachine } from "./NullMachine";
import { FetchMachine } from "./FetchMachine";
import { LoginMachine } from "./LoginMachine";
import { LogoutMachine } from "./LogoutMachine";

import { SmsTask } from "../services/SmsTask";
import { Accounting } from "../services/Accounting";
import { Profile } from "../services/Profile";
import { Order } from "../services/Order";
import { Product } from "../services/Product";
import { EditorMachineLite } from "./EditorMachineLite";
import { Campaign } from "../services/Campaign";


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
        orders: {},
        login: {},
        logout: {},
        campaign: {},
    },
    on: {
        "NAV_HOME": { target: "home", actions: ["assignHomeActor"] },
        "NAV_SEND_SMS": { target: "sendSMS", actions: ["assignSendSmsActor"] },
        "NAV_SMS_REPORT": { target: "smsReport", actions: ["assignSmsReportActor"] },
        "NAV_CASH_DEPOSIT": { target: "cashDeposit", actions: ["assignCashDepositActor"] },
        "NAV_ORDERS": { target: "orders", actions: ["assignOrdersActor"] },
        "LOGIN": { target: "login", actions: ["assignLoginActor"] },
        "LOGOUT": { target: "logout", actions: ["assignLogoutActor"] },
        "NAV_CAMPAIGN": { target: "campaign", actions: ["assignCampaignActor"] },
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
            actor: spawn(EditorMachineLite)
        })),
        assignSendSmsActor: assign((ctx, ev) => {
            const actor = spawn(EditorMachineLite);

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
                ))
            ];
            return { actor };
        }),
        assignOrdersActor: assign((ctx, ev) => {
            const actor = [
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Order.fetchOrders }
                    },
                    {
                        payload: { data: { page: 1, limit: 10 } },
                        result: { orders: [], count: 0 },
                        error: { message: "Waiting for Order Search" }
                    }
                )),
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Order.createOrder }
                    }
                )),
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Product.fetchProducts }
                    },
                    {
                        payload: { data: { page: 1, limit: 10 } },
                        result: { products: [], count: 0 },
                        error: { message: "Waiting for Product Search" }
                    }
                ))
            ];
            return { actor };
        }),
        assignLoginActor: assign((ctx, ev) => ({
            actor: spawn(LoginMachine)
        })),
        assignLogoutActor: assign((ctx, ev) => ({
            actor: spawn(LogoutMachine)
        })),
        assignCampaignActor: assign((ctx, ev) => {
            const actor = [
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Campaign.fetchCampigns }
                    },
                    {
                        payload: { data: { page: 1, limit: 10 } },
                        result: { campaigns: [], count: 0 },
                        error: { message: "Waiting for Campaign Search" }
                    }
                )),
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Campaign.saveCampaign }
                    }
                )),
                spawn(FetchMachine.withConfig(
                    {
                        services: { doFetch: Campaign.fetchCampaignTasks }
                    },
                    {
                        payload: { data: { page: 1, limit: 10 } },
                        result: { campaign: {}, tasks: [], count: 0 },
                        error: { message: "" }
                    }
                ))
            ];
            return { actor };
        }),
    }
});
