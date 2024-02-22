import React, { useCallback } from 'react'
import { Close, OpenWith } from '@mui/icons-material'
import { useNodes, useReactFlow } from 'reactflow';

export default function ActionController({ show, data, setInputField, nodeId }) {
    const { setNodes } = useReactFlow();
    const nodes = useNodes();

    const onCancel = useCallback(() => {
        setNodes(nodes.filter(i => i.id !== nodeId))
    }, [nodeId, nodes, setNodes]);

    return (
        <div className={`component-btn-group action-controller ${!show ? "visibility-hidden" : ""}`}>
            <div className="btn-secondary component-settings-button" role="button">
                <OpenWith style={{ fontSize: "14px" }} />
            </div>
            <div className="btn-danger component-settings-button nodrag" role="button" onClick={onCancel}>
                <Close style={{ fontSize: "14px" }} />
            </div>
        </div >
    )
}
