import React, { useCallback, useMemo, useState } from 'react'
import { Card } from 'react-bootstrap'
import { useNodes, useReactFlow } from 'reactflow';
import AddOptions from './AddOptions';
import { getJsonForm } from './fieldJSONForm';
import FormGenerator from 'Components/FormBuilder/Build/pages/FormGenerator'
import { onUploadImage, uploadToS3 } from 'utils/AWS_S3/s3Connection';
import { toastPromise } from 'redux/common';

export default function Properties({ field, setField, output }) {

    return (
        <Card>
            <Card.Header>
                Field Properties
            </Card.Header>
            <Card.Body className='overflow-scroll hide-horizonal-scroll' style={{ maxHeight: "90vh" }}>
                {field && field?.id ?
                    <FieldProperties key={field?.id} nodeId={field.id} setField={setField} output={output} /> :
                    <div className='text-center'>
                        Select field
                    </div>
                }
            </Card.Body>
        </Card>
    )
}

const FieldProperties = ({ nodeId, setField, output }) => {
    const { setNodes, getNode } = useReactFlow();
    const nodes = useNodes();
    const node = getNode(nodeId);
    const [options, setOptions] = useState(
        (["CheckBoxNode", "RadioNode", "SelectNode"].includes(node?.type)) ?
            (node?.data?.options ? node.data.options : [{ label: "", value: "" }])
            : []);

    const onSaveFieldProperty = useCallback((data) => {
        if (node.data) {
            setNodes(nodes.map((nd) => {
                if (nd.id === node.id) {
                    nd.data = { ...nd.data, ...data, id: nd.id }
                    if (!!data?.show?.length || !!data?.when?.length || data?.eq) {
                        nd.data.conditional = {
                            ...nd.data.conditional,
                            show: (!!data?.show?.length && data?.show[0]?.value) || data?.conditional?.show || "",
                            when: (!!data?.when?.length && data?.when[0].value) || data?.conditional?.when || "",
                            eq: data?.eq || data.conditional?.eq || "",
                        }
                    }
                    if (options && !!options.length) nd.data = { ...nd.data, options }
                }
                else if (!!data?.show?.length && data?.show[0]?.value) {
                    nd.data = { ...nd.data, dependant: true }
                }
                return nd;
            }));
            setField(prev => ({ ...prev, data: { ...prev.data, ...data, options } }))
        }
    }, [options, nodes, node?.id, setNodes, setField, node?.data]);

    const getNodesOption = useCallback(() => {
        if (!node?.id) return [];
        return nodes
            .filter(i => i.id !== node?.id)
            .map((i) => ({ id: i.id, label: i.data?.name || "unknown field", name: i.data?.name, value: i.id || "" }))
    }, [node?.id, nodes]);

    const formData = useMemo(() => {
        const node = getNode(nodeId);
        if (!node?.type || !node?.data) return;
        const nodesOption = getNodesOption();
        const beforeSubmit = async ({ setError, data, setFocus }) => {
            const names = nodesOption.map(i => i.name || "");
            if (names.includes(data["name"])) {
                setError("name", {
                    type: "required",
                    message: "Field should be unique"
                });
                setFocus("name");
                // showError("Please enter unique name to the field");
                return { shouldSubmit: false, payload: data };
            } else {
                // Clear the error if the value is valid
                setError("name", null);
            }
            if (data.image && data.image[0]) {
                await toastPromise({
                    func: async (resolve, reject) => {
                        try {
                            const [file] = data.image;
                            const presignedUrl = await onUploadImage(file);
                            const uploadedImageUrl = await uploadToS3(presignedUrl, file);
                            data.imageURL = uploadedImageUrl;
                            uploadedImageUrl && delete data.image;
                            resolve(1);
                        } catch (error) {
                            reject(0);
                        }
                    },
                    loading: "Uploading file", success: "File uploaded on server", error: "Couldn't upload file"
                })
            }
            return { shouldSubmit: true, payload: data };
        };

        const jsonForm = getJsonForm({ type: node.type, data: node.data, nodesOption, output });
        return (
            <FormGenerator
                className="m-0"
                dataFields={jsonForm}
                buttonsClass="px-0"
                resetOnSubmit={false}
                spinner={false}
                beforeSubmit={beforeSubmit}
                onSubmit={onSaveFieldProperty}
            />
        )
        //eslint-disable-next-line
    }, [nodeId, onSaveFieldProperty]);

    return (<>
        {["CheckBoxNode", "RadioNode", "SelectNode"].includes(node?.type) &&
            <AddOptions options={options} setOptions={setOptions} />}
        {formData}
    </>)
}
