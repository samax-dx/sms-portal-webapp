import { createMachine } from "xstate";


export const NullMachine = createMachine({
    states: {
        live: {}
    },
    context: {},
    initial: "live"
});
