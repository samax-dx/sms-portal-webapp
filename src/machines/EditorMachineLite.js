import { assign, createMachine } from "xstate";


export const EditorMachineLite = createMachine({
    states: {
        isEditing: {
            on: {
                "SAVE_RECORD": { target: "isSaving" }
            }
        },
        didSave: {
            on: {
                "EDIT_RECORD": { target: "isEditing" }
            }
        },
        isSaving: {
            on: {
                "SAVE_SUCCESS": { target: "doneSaving", actions: ["assignSuccessNext"] },
                "SAVE_FAILURE": { target: "doneSaving", actions: ["assignFailureNext"] },
                "EDIT_RECORD": { actions: ["assignChangedNext"] }
            }
        },
        doneSaving: {
            always: [
                { target: "didSave", cond: (ctx, _) => ctx._nextState === "didSave" },
                { target: "isEditing", cond: (ctx, _) => ctx._nextState === "isEditing" }
            ],
            exit: assign({ _nextState: "" })
        }
    },
    on: {
        "FETCHED": "didSave"
    },
    initial: "didSave",
    context: { _nextState: null },
}, {
    actions: {
        assignSuccessNext: assign((ctx, _) => ({ _nextState: ctx._nextState || "didSave" })),
        assignFailureNext: assign((ctx, _) => ({ _nextState: "isEditing" })),
        assignChangedNext: assign({ _nextState: "isEditing" }),
    }
});
