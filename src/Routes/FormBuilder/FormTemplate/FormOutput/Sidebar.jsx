import React, { useMemo } from 'react'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { List, ListItem } from '@mui/material'
import { MuiActionButton } from 'Components/MuiDataGrid'
import { Card } from 'react-bootstrap'
import { useNodes, useReactFlow } from 'reactflow'
import { useMount } from 'react-use'

export default function Sidebar({ jsonSchema }) {
    const nodes = useNodes();
    const { setNodes } = useReactFlow();

    useMount(() => {
        const newForm = jsonSchema.components.map((item) => {
            return {
                ...item,
                position: item.output?.position || item.position,
            }
        });
        setNodes(newForm)
    })

    // const onSave = useCallback(() => {
    //     const newForm = jsonSchema.components.map((item) => {
    //         const node = getNode(item.id);
    //         return {
    //             ...item,
    //             output: {
    //                 ...item.output,
    //                 ...node.output,
    //                 position: node.position
    //             }
    //         }
    //     })
    //     onFormChange({ components: newForm })
    // }, [jsonSchema, onFormChange, getNode]);

    const listOfFields = useMemo(() => (
        <List className='mb-2'>
            {nodes.map((item) => {
                if (!item.hasOwnProperty("output")) item.output = {}
                return (
                    <ListItem key={item.id}>
                        <FieldData field={item} />
                    </ListItem>)
            })}
        </List>
    ), [nodes]);
    return (
        <div>
            <Card className="">
                <Card.Header>
                    Form Fields
                </Card.Header>
                <Card.Body className='overflow-scroll hide-horizonal-scroll p-0' style={{ maxHeight: "60vh" }}>
                    {listOfFields}
                </Card.Body>
                {/* <Card.Footer>
                    <div className='d-flex gap-10 justify-content-end'>
                        <Button variant='secondary'>
                            Reset
                        </Button>
                        <Button variant='primary' onClick={onSave}>
                            Save
                        </Button>
                    </div>
                </Card.Footer> */}
            </Card>
        </div>
    )
}

const FieldData = ({ field }) => {
    const nodes = useNodes();
    const { setNodes } = useReactFlow();

    // const onDragStart = useCallback((event, nodeType) => {
    //     event.dataTransfer.setData('application/reactflow', nodeType);
    //     event.dataTransfer.effectAllowed = 'move';
    // }, []);

    const toggleVisibility = () => {
        setNodes(nodes.map((nd) => {
            if (nd.id === field.id) {
                if (nd.output.hasOwnProperty("visibility")) return { ...nd, output: { ...nd.output, visibility: !nd.output.visibility } }
                else nd.output.visibility = false;
            }
            return nd;
        }));
    };

    return (
        <div className='d-flex align-items-center gap-5'>
            {/* <div style={{ cursor: "grab" }} draggable onDragStart={event => onDragStart(event, field)}>
                <DragIndicator />
            </div> */}
            <MuiActionButton Icon={field.output?.hasOwnProperty("visibility") && !field.output?.visibility ? VisibilityOff : Visibility}
                onClick={toggleVisibility} />
            <div className='text-truncate in-one-line'>
                {field.data.label}
            </div>
        </div>
    )
}