import './App.less';

import { useActor } from '@xstate/react';

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
import { MyPayment } from './components/MyPayment';


export const App = ({ actor }) => {
    const [current, send] = useActor(actor);
    const component = capitalize(current.value);

    // useEffect(() => {
    //     const saveApp = () => {
    //         localStorage.setItem("lastState", JSON.stringify(current));
    //     };

    //     window.addEventListener('beforeunload', saveApp);
    //     return () => window.removeEventListener("beforeunload", saveApp);
    // }, [current]);

    return (
        <AppLayout render={{ Home, SendSMS, SmsReport, CashDeposit, Campaign, CampaignTaskReport, Orders, BuyPackage, MyPackage, MyPayment, Login }[component]} actor={actor} />
    );
};
