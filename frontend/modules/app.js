import { appTemplate } from "./template.js";
import { useAppState } from "./state.js";

export const App = {
    template: appTemplate,
    setup: useAppState
};
