import { createMachine } from "xstate";
import { XAuth } from "../services/XAuth";


export const LoginMachine = createMachine({
    states: {
        idle: {
            on: { "SUBMIT": "submit" }
        },
        submit: {
            invoke: {
                src: (ctx, ev) => XAuth.login(ev.data),
                onDone: { target: "success", actions: (ctx, ev) => ctx.token = ev.data.token },
                onError: { target: "error", actions: (ctx, ev) => ctx.error = ev.data.message },
            }
        },
        error: {
            on: { "SUBMIT": "submit" }
        },
        success: {},
    },
    context: {
        token: "",
        error: ""
    },
    initial: "idle"
});
