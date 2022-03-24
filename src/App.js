import './App.less';

import { useActor } from '@xstate/react';

import { AppLayout } from "./components/AppLayout";
import { Home } from './components/Home';
import { SendSMS } from './components/SendSMS';
import { Login } from './components/Login';
import { capitalize } from './Util';


export const App = ({ actor }) => {
    const [current, send] = useActor(actor);
    const component = capitalize(current.value);

    return (
        <AppLayout render={{ Home, SendSMS, Login }[component]} actor={actor} />
    );
};
