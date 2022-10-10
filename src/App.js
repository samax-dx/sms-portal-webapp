import './App.less';
import { useActor } from '@xstate/react';
import {Routes} from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { Home } from './components/Home';
import { SendSMS } from './components/SendSMS';
import { Login } from './components/Login';
import { SmsReport } from './components/SmsReport';
import { CashDeposit } from './components/CashDeposit';
import { capitalize } from './Util';
import { useEffect } from 'react';
import { Orders } from './components/Orders';
import { Campaign } from './components/Campaign';
import { SmsHistoryOld } from './components/SmsHistoryOld';
import { BuyPackage } from './components/BuyPackage';
import { MyPackage } from './components/MyPackage';
import {BrowserRouter, Route as ReactRoute} from "react-router-dom";
import * as PropTypes from "prop-types";
import {MyPaymentNew} from "./components/MyPaymentNew";
import {OrdersNew} from "./components/OrdersNew";
import {MyPackageNew} from "./components/MyPackageNew";
import {BuyPackageNew} from "./components/BuyPackageNew";
import {SmsHistory} from "./components/SmsHistory";
import {CampaignNew} from "./components/CampaignNew";
import {CampaignTaskReport} from "./components/CampaignTaskReport";
import {SendSmsNew} from "./components/SendSmsNew";

export const App = ({ actor }) => {
    const [current, send] = useActor(actor);
    const component = capitalize(current.value);

    const createRouteComponent = rc => <AppLayout
        render={{
            Home, SendSMS, SmsReport, CashDeposit, Campaign, CampaignTaskReport: SmsHistoryOld,
            Orders, BuyPackage, MyPackage, Login
        }[component]}
        actor={actor}
        routeComponent={rc}
    />;

    return (
        <BrowserRouter>
            <Routes>
                <ReactRoute path="/" element={createRouteComponent(null)} />
                <ReactRoute path="/paymentHistory" element={createRouteComponent(<MyPaymentNew />)} />
                <ReactRoute path="/orderHistory" element={createRouteComponent(<OrdersNew />)} />
                <ReactRoute path="/myPackage" element={createRouteComponent(<MyPackageNew />)} />
                <ReactRoute path="/buyPackage" element={createRouteComponent(<BuyPackageNew />)} />
                <ReactRoute path="/smsHistory" element={createRouteComponent(<SmsHistory />)} />
                <ReactRoute path="/campaign" element={createRouteComponent(<CampaignNew />)} />
                <ReactRoute path="/campaign/:campaignId" element={createRouteComponent(<CampaignTaskReport />)} />
                <ReactRoute path="/sendSms" element={createRouteComponent(<SendSmsNew />)} />
            </Routes>
        </BrowserRouter>
    );
};
