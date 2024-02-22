import React, { memo, useCallback, useEffect, useState } from 'react';
import { NodeResizer, useNodes, useReactFlow } from 'reactflow';
import { useHover } from 'react-use';
import ActionController from '../ActionController';
import DatePicker from "react-datepicker";
import { Form } from 'react-bootstrap';
import moment from 'moment-timezone';

export default memo((props) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const { id, selected, setInputField, rendered = false, output } = props;
    const node = getNode(id);
    const { data: nodeData } = node;
    const [selectedDate, setSelectedDate] = useState(nodeData.value || "");

    const onChangeValueNode = useCallback((selectedDate) => {
        if (!rendered) return;
        setNodes(
            nodes.map((node) => {
                if (node.id === id)
                    node.data = { ...node.data, value: selectedDate ? moment(selectedDate).format() : "" };
                return node;
            })
        );
    }, [id, setNodes, nodes, rendered]);

    useEffect(() => {
        if (!rendered) return;
        onChangeValueNode(selectedDate);
        //eslint-disable-next-line
    }, [selectedDate, rendered]);

    const element = (hovered) => {
        return (
            <div className={`m-1 cstm-field-edit-border cstm-form-input-field ${hovered && !rendered ? "hovered" : ""}`}>
                {!rendered && <ActionController show={true} nodeId={id} setNodes={setNodes} setInputField={setInputField} />}
                {!rendered &&
                    <NodeResizer
                        color="#ff0071"
                        isVisible={selected}
                        minWidth={100}
                        minHeight={57} />}
                <div className="form-inline">
                    <div className="input-group theme-border w-100 p-1">
                        {/* {data.isDateRange ? (
							<DatePicker
								className={`form-control`}
								placeholderText={placeholder ? placeholder : label}
								selected={field.value && field.value[0]}
								selectsRange
								isClearable={config.isClearable}
								autoComplete="off"
								startDate={field.value && field.value[0]}
								endDate={field.value && field.value[1]}
								disabled={isEditable === false}
								onChange={(dates) => {
									if (isEditable === false) return;
									field.onChange(dates.filter((d) => !!d));
									changeHandler(dates);
								}}
							/>
						) : ( */}
                        <Form.Label>{nodeData.label || ""}</Form.Label>
                        <DatePicker
                            className={`form-control w-100`}
                            placeholderText={nodeData.placeholder}
                            selected={selectedDate}
                            disabled={nodeData.isEditable === false}
                            onChange={(date) => {
                                if (nodeData.isEditable === false)
                                    return;
                                // nodeData.onChange(date);
                                setSelectedDate(date)
                                // changeHandler(date);
                            }}
                            isClearable={!!nodeData?.isClearable?.length && nodeData?.isClearable[0] === "true"}
                            showTimeSelect={!!nodeData?.showTime?.length && nodeData.showTime[0] === "true"}
                            timeFormat="HH:mm"
                            autoComplete="off"
                            timeIntervals={15}
                            dateFormat="MMMM d, yyyy h:mm aa"
                            timeCaption="time"
                        />
                        {/* )} */}
                    </div>
                </div>
            </div>
        )
    };
    const [hoverable, hovered] = useHover(element);

    if (output && node.output?.hasOwnProperty("visibility") && !node.output.visibility) return;

    if (nodeData.conditional && rendered) {
        const dependantValue = !!nodes?.length && nodeData?.conditional?.when && nodes?.find(nd => nd.id === nodeData.conditional.when)?.data?.value;
        if ((nodeData.conditional.show === "true" && dependantValue !== nodeData?.conditional?.eq) ||
            (nodeData.conditional.show === "false" && dependantValue === nodeData?.conditional?.eq)) {
            return <div></div>
        }
    }

    return (
        <div className={`${hovered ? "" : ""}`}>
            {hoverable}
        </div>
    );
});