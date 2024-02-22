import ComponentEditData from "./editForm/Component.edit.data";
import ComponentEditDisplay from "./editForm/Component.edit.display";
import ComponentEditValidation from "./editForm/Component.edit.validation";
import ComponentEditConditional from "./editForm/Component.edit.conditional";

const inputDialogueTabs = {
    type: 'tabs',
    key: 'tabs',
    components: [
        {
            label: 'Display',
            key: 'display',
            weight: 0,
            components: ComponentEditDisplay
        },
        {
            label: 'Data',
            key: 'data',
            weight: 10,
            components: ComponentEditData
        },
        {
            label: 'Validation',
            key: 'validation',
            weight: 20,
            components: ComponentEditValidation
        },
        {
            label: 'Conditional',
            key: 'conditional',
            weight: 40,
            components: ComponentEditConditional
        },
        // {
        //     label: 'Logic',
        //     key: 'logic',
        //     weight: 50,
        //     components: ComponentEditLogic
        // },
        // {
        //     label: 'Layout',
        //     key: 'layout',
        //     weight: 60,
        //     components: ComponentEditLayout
        // },
    ]
}
export default inputDialogueTabs;