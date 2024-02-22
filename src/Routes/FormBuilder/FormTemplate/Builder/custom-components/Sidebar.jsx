import React, { useCallback } from 'react';
// import { Accordion, Col } from 'react-bootstrap';

// Tools Icons
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CancelIcon from '@mui/icons-material/Cancel';

// Input field Icons
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DrawIcon from '@mui/icons-material/Draw';
import SmartButton from '@mui/icons-material/SmartButton';
import Image from '@mui/icons-material/Image';
import { MuiTooltip } from 'Components/components';
import { Calendar, InputCursorText, MenuDown, TextareaT, UiChecks, UiRadios } from 'react-bootstrap-icons';

const inputFields = [
    {
        group: "Tools",
        fields: [
            {
                id: "cutfield",
                name: "CutNode",
                label: "Cut",
                action: "cut",
                icon: <ContentCutIcon />
            },
            {
                id: "copyfield",
                name: "CopyNode",
                label: "Copy",
                action: "copy",
                icon: <ContentCopyIcon />
            },
            {
                id: "pastefield",
                name: "PasteNode",
                label: "Paste",
                action: "paste",
                icon: <ContentPasteIcon />
            },
            {
                id: "cancelfield",
                name: "CancelNode",
                label: "Cancel",
                action: "cancel",
                icon: <CancelIcon />
            },
        ]
    },
    {
        group: "Basic",
        fields: [
            {
                id: "labelfield",
                name: "LabelNode",
                label: "Text Label",
                icon: <TextFieldsIcon />
            },
            {
                id: "textfield",
                name: "TextFieldNode",
                label: "Input Text",
                icon: <InputCursorText fontSize={22} fontWeight="bold" />
            },
            {
                id: "textarea",
                name: "TextAreaNode",
                label: "Textarea",
                icon: <TextareaT fontSize={22} fontWeight="bold" />
            },
            // {
            //     id: "number",
            //     name: "NumberNode",
            //     label: "Number",
            //     icon: <></>
            // },
            // {
            //     id: "password",
            //     name: "PasswordNode",
            //     label: "Password",
            //     icon: <></>
            // },
            {
                id: "checkbox",
                name: "CheckBoxNode",
                label: "Checkbox",
                icon: <UiChecks fontSize={22} fontWeight="bold" />
            },
            {
                id: "select",
                name: "SelectNode",
                label: "Select",
                icon: <MenuDown fontSize={22} fontWeight="bold" />
            },
            {
                id: "radio",
                name: "RadioNode",
                label: "Radio",
                icon: <UiRadios fontSize={22} fontWeight="bold" />
            },
            {
                id: "image",
                name: "ImageNode",
                label: "Image",
                icon: <Image />
            },
            {
                id: "button",
                name: "ButtonNode",
                label: "Button",
                icon: <SmartButton />
            },
        ]
    },
    {
        group: "Advance",
        fields: [
            // {
            //     id: "emailField",
            //     name: "EmailNode",
            //     label: "Email",
            //     icon: <></>
            // },
            // {
            //     id: "urlField",
            //     name: "UrlNode",
            //     label: "URL",
            //     icon: <></>
            // },
            // {
            //     id: "phoneField",
            //     name: "PhoneNumberNode",
            //     label: "Phone Number",
            //     icon: <></>
            // },
            {
                id: "dateTimeField",
                name: "DateTimeNode",
                label: "Date / Time",
                icon: <Calendar fontSize={22} fontWeight="bold" />
            },
            // {
            //     id: "timeField",
            //     name: "TimeNode",
            //     label: "Time",
            //     icon: <></>
            // },
            // {
            //     id: "currencyField",
            //     name: "CurrencyNode",
            //     label: "Currency",
            //     icon: <></>
            // },
            {
                id: "signatureField",
                name: "SignatureNode",
                label: "Signature",
                icon: <DrawIcon />
            },
        ]
    },
];

export default function Sidebar({
    onCopyNode,
    onPasteNode,
    onCutNode,
    onCancelNode
}) {
    const onDragStart = useCallback((event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    }, []);

    const onClickTool = useCallback((field) => {
        if (field.action === "copy") onCopyNode(field);
        else if (field.action === "cut") onCutNode(field);
        else if (field.action === "paste") onPasteNode(field);
        else onCancelNode(field);

    }, [onCopyNode, onPasteNode, onCutNode, onCancelNode]);

    return (
        <div className="btn-toolbar mb-2" role="toolbar" aria-label="Toolbar with button groups">
            {inputFields.map((group, index1) => {
                return (
                    <div className="btn-group mr-2 mb-2" role="group" aria-label="First group" key={index1}>
                        {group.fields.map((inputfield, index2) => (
                            <MuiTooltip title={inputfield.label} key={index2}>
                                <button
                                    className="btn btn-secondary formcomponent drag-copy"
                                    onDragStart={(event) => onDragStart(event, inputfield.name)}
                                    draggable={group.group !== "Tools"}
                                    onClick={() => {
                                        if (group.group === "Tools") onClickTool(inputfield)
                                    }}
                                    key={index2}
                                >
                                    {inputfield?.icon}
                                </button>
                            </MuiTooltip>
                        )
                        )}
                    </div>
                )
            })
            }
        </div>
    )
}
