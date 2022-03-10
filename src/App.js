import './App.less';

import { useActor } from '@xstate/react';

import { AppLayout } from "./components/AppLayout";
import { Home } from './components/Home';
import { Party } from './components/Party';
import { SendSMS } from './components/SendSMS';
import { capitalize } from './util';


export const App = ({ actor }) => {
    const [current, send] = useActor(actor);
    const component = capitalize(current.value);

    return (
        <AppLayout render={{ Home, Party, SendSMS }[component]} actor={actor} />
    );
};
