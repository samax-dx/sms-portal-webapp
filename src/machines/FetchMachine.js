import { assign, createMachine } from "xstate";


export const FetchMachine = createMachine({
    initial: "idle",
    states: {
        idle: {
            on: {
                "LOAD": { target: "fetching", actions: ["assignPayload"] },
            }
        },
        fetching: {
            invoke: {
                src: "doFetch",
                onDone: { target: "hasResult", actions: ["setResult"] },
                onError: { target: "hasError", actions: ["setError"] },
            }
        },
        hasResult: {
            after: { 0: { target: "idle" } }
        },
        hasError: {
            after: { 0: { target: "idle" } }
        },
    },
    context: {
        result: null,
        error: null,
        payload: null,
    },
    id: undefined,
}, {
    actions: {
        setResult: assign((ctx, ev) => ({ result: ev.data, error: null })),
        setError: assign((ctx, ev) => ({ error: ev.data, result: null })),
        assignPayload: assign((ctx, ev) => ({ payload: { ...ev } })),
    }
});
