import { createMachine, sendParent } from "xstate";
import { XAuth } from "../services/XAuth";


export const LogoutMachine = createMachine({
    states: {
        idle: {
            entry: [() => XAuth.logout(), sendParent("LOGIN")]
        }
    },
    context: {},
    initial: "idle"
});
