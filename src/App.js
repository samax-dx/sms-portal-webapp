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
import {Groups} from "./components/Group";
import {Contact} from "./components/Contact";
import {AllContact} from "./components/AllContact";
import {HomeNew} from "./components/HomeNew";
import {ProfileView} from "./components/ProfileView";

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
                <ReactRoute path="/" element={createRouteComponent(<HomeNew />)} />
                <ReactRoute path="/balance/paymentHistory" element={createRouteComponent(<MyPaymentNew />)} />
                <ReactRoute path="/order/orderHistory" element={createRouteComponent(<OrdersNew />)} />
                <ReactRoute path="/order/myPackage" element={createRouteComponent(<MyPackageNew />)} />
                <ReactRoute path="/order/buyPackage" element={createRouteComponent(<BuyPackageNew />)} />
                <ReactRoute path="/messaging/smsHistory" element={createRouteComponent(<SmsHistory />)} />
                <ReactRoute path="/messaging/campaign" element={createRouteComponent(<CampaignNew />)} />
                <ReactRoute path="/messaging/campaign/:campaignId" element={createRouteComponent(<CampaignTaskReport />)} />
                <ReactRoute path="/messaging/sendSms" element={createRouteComponent(<SendSmsNew />)} />
                <ReactRoute path="/contactBook/groups" element={createRouteComponent(<Groups />)} />
                <ReactRoute path="/contactBook/allContact" element={createRouteComponent(<AllContact />)} />
                <ReactRoute path="/contactBook/groups/:groupId" element={createRouteComponent(<Contact/>)} />
                <ReactRoute path="/userProfile" element={createRouteComponent(<ProfileView/>)} />
            </Routes>
        </BrowserRouter>
    );
};
