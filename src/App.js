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
import { CampaignTaskReport } from './components/CampaignTaskReport';
import { BuyPackage } from './components/BuyPackage';
import { MyPackage } from './components/MyPackage';
import {BrowserRouter, Route as ReactRoute} from "react-router-dom";
import * as PropTypes from "prop-types";
import {MyPaymentNew} from "./components/MyPaymentNew";

export const App = ({ actor }) => {
    const [current, send] = useActor(actor);
    const component = capitalize(current.value);

    const createRouteComponent = rc => <AppLayout
        render={{
            Home, SendSMS, SmsReport, CashDeposit, Campaign, CampaignTaskReport,
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
            </Routes>
        </BrowserRouter>
    );
};
