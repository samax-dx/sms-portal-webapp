import { assign, createMachine, send, spawn } from "xstate";

import { NullMachine } from "./NullMachine";
import { FetchMachine, spawnFetcher } from "./FetchMachine";
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
        assignSendSmsActor: assign((ctx, ev) => ({
            actor: spawn(EditorMachineLite)
        })),
        assignSmsReportActor: assign((ctx, ev) => ({
            actor: spawn(NullMachine)
        })),
        assignCashDepositActor: assign((ctx, ev) => ({
            actor: [
                spawnFetcher(
                    Accounting.fetchBalanceRequests,
                    { data: { page: 1, limit: 10 } },
                    { payments: [], count: 0 },
                    { message: "Waiting for Deposit Search" }
                ),
                spawnFetcher(
                    Accounting.requestDeposit,
                    { data: {} },
                    { paymentId: null },
                    { message: "Waiting for Payment Save" }
                )
            ]
        })),
        assignOrdersActor: assign((ctx, ev) => ({
            actor: [
                spawnFetcher(
                    Order.fetchOrders,
                    { data: { page: 1, limit: 10 } },
                    { orders: [], count: 0 },
                    { message: "Waiting for Order Search" }
                ),
                spawnFetcher(
                    Order.createOrder,
                    { data: {} },
                    { orderId: null },
                    { message: "Waiting for Order Save" }
                ),
                spawnFetcher(
                    Product.fetchProducts,
                    { data: { page: 1, limit: 10 } },
                    { products: [], count: 0 },
                    { message: "Waiting for Product Search" }
                )
            ]
        })),
        assignLoginActor: assign((ctx, ev) => ({
            actor: spawn(LoginMachine)
        })),
        assignLogoutActor: assign((ctx, ev) => ({
            actor: spawn(LogoutMachine)
        })),
        assignCampaignActor: assign((ctx, ev) => ({
            actor: [
                spawnFetcher(
                    Campaign.fetchCampigns,
                    { data: { page: 1, limit: 10 } },
                    { campaigns: [], count: 0 },
                    { message: "Waiting for Campaign Search" }
                ),
                spawnFetcher(
                    Campaign.saveCampaign,
                    { data: {} },
                    { campaignId: null },
                    { message: "Waiting for Campaign Save" }
                ),
                spawnFetcher(
                    Campaign.fetchCampaignTasks,
                    { data: { page: 1, limit: 10 } },
                    { campaign: {}, tasks: [], count: 0 },
                    { message: "Waiting for Campaign-Task Search" }
                )
            ]
        })),
    }
});
