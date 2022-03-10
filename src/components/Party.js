import { useActor } from "@xstate/react";
import { useRef } from "react";

import { PartyList } from "./PartyList";
import { PartyView } from "./PartyView";


export const Party = ({ actor }) => {
    const [partyState, sendParty] = useActor(actor);
    const { actor: stateActor } = partyState.context;

    const listActorRef = useRef(null);
    ["listView", "itemView"].some(partyState.matches) && (listActorRef.current = stateActor);

    return (<>
        <PartyList actor={listActorRef.current} />
        {["itemView"].some(partyState.matches) && <PartyView actor={stateActor} />}
    </>);
};
