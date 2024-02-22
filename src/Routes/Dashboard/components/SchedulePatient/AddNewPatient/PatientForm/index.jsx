import React, { useRef, useCallback, useEffect } from 'react'
import { debounce } from 'lodash';
import { Col, Row } from 'react-bootstrap';
import AsyncCreatableSelect from 'react-select/async-creatable';
import ReactDatePicker from 'react-datepicker';
import ReactSelect from 'react-select';
import moment from 'moment-timezone';
import PhoneInput2 from "react-phone-input-2";
import { CONST } from 'utils/constants';
import { TakeConfirmation } from 'Components/components';
import Input from 'Components/FormBuilder/components/Input';
import "react-phone-input-2/lib/style.css";
import Divider from 'antd/lib/divider'
import patientService from 'services/APIs/services/patientService';
import { PureName } from 'services/helper/default';
import { generatePayload } from 'redux/common';

export default function PatientForm({ state, setState, updateData }) {
    const { patientData, isPatientloading } = state;
    const selectRef = useRef();

    useEffect(() => {
        selectRef.current.focus();
    }, []);

    const inputChange = useCallback((e) => {
        const { value, name } = e.target;
        if (name === "lastName" && value) {
            const onChange = () => {
                let val = value?.value || null;
                if (value?.__isNew__) val = val?.charAt(0).toUpperCase() + val?.slice(1);
                const patientSlot = !!val?.patientSlots?.length && val.patientSlots[0];
                setState(prev => {
                    const provider = patientSlot && val.patientAssigns.find(i => i.userId === patientSlot.providerId)
                    let body = {
                        ...prev,
                        nextOfKin: value?.value?.patientGuardians || prev.nextOfKin,
                        facility: val?.facilityInfo ? { id: val.facilityInfo.id, label: val.facilityInfo.name, value: val.facilityInfo, autoSet: 'auto-set-field' } : { ...prev.facility, autoSet: null },
                        provider: provider ? { id: provider.userId, label: provider.usersPatient.name, value: { id: provider.userId }, autoSet: 'auto-set-field' } : { ...prev.provider, autoSet: null }
                    };
                    if (prev.isNewPatient && value?.__isNew__) body = { ...body, } // ...defaultState
                    if (!value) return { ...body, patientData: {}, isNewPatient: true }
                    else if (!value?.__isNew__) return { ...body, patientData: { ...val }, isNewPatient: false }
                    else if (value?.__isNew__) return { ...body, patientData: { ...prev.patientData, [name]: val }, isNewPatient: true }
                    else return body
                })
            }
            if (value && !!Object.keys(patientData).length && (patientData.firstName || patientData.middleName)) {
                TakeConfirmation({
                    title: "Are you sure to change the patient?",
                    content: "Once you confirm the entered patient data would be changed.",
                    onDone: onChange
                });
            } else onChange();
        }
        else {
            setState(prev => ({
                ...prev, patientData: { ...prev.patientData, [name]: value }
            }))
        }
    }, [setState, patientData]);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Tab') {
            const selectElement = selectRef.current.select;
            if (selectElement) {
                const focusedOption = selectElement.state.focusedOption;
                if (focusedOption)
                    inputChange({ target: { name: 'lastName', value: focusedOption } }) // Trigger your custom onChange event with the selected option
            }
        }
    }, [inputChange]);

    const autoCapitalizeField = useCallback((e) => {
        const { value } = e.target;
        e.target.value = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
        inputChange(e);
    }, [inputChange]);

    const loadPatientSuggestions = debounce((query, callback) => {
        getPatients(query).then((res) => {
            if (res.status === 1)
                callback(res.data.map(i => ({ id: i.id, value: i, label: PureName(i.firstName + ' ' + i.lastName) })));
        });
    }, 1000);

    return (
        <Row>
            <Col xs={12}>
                <Divider className='text-color mt-4' style={{ borderColor: 'grey' }} orientation='left'>
                    Patient Details
                </Divider>
            </Col>
            <Col md={6} className="form-group mb-0">
                <label htmlFor="firstName">
                    Lastname
                    <small className='text-danger'>*</small>
                </label>
                <AsyncCreatableSelect
                    defaultOptions={[]}
                    ref={selectRef}
                    classNamePrefix="select"
                    className={`basic-single`}
                    placeholder={"Last name"}
                    loadOptions={loadPatientSuggestions}
                    isLoading={isPatientloading}
                    isClearable={true}
                    value={patientData.lastName ? [{ label: patientData.lastName, value: patientData.lastName }] : null}
                    onKeyDown={handleKeyDown}
                    onChange={(value) => {
                        inputChange({ target: { name: 'lastName', value } })
                    }}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <Input
                    Label="Firstname"
                    placeholder="First name"
                    name="firstName"
                    handleChange={inputChange}
                    formgroupClass=''
                    isRequired={false}
                    type="text"
                    error=''
                    value={patientData.firstName}
                    inputProps={{ onBlurCapture: autoCapitalizeField }}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <Input
                    Label="Middlename"
                    placeholder="Middle name"
                    name="middleName"
                    handleChange={inputChange}
                    formgroupClass=''
                    isRequired={false}
                    type="text"
                    error=''
                    value={patientData.middleName}
                    inputProps={{
                        onBlurCapture: autoCapitalizeField
                    }}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <label htmlFor="Phone">Phone</label>
                <PhoneInput2
                    value={patientData?.phone || ""}
                    inputClass="w-100"
                    placeholder={"phone"}
                    label={"phone"}
                    name={"phone"}
                    onChange={(value) => inputChange({ target: { name: 'phone', value } })}
                    country={"us"}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <Input
                    Label="Insurance"
                    placeholder="Insurance"
                    name="insurance"
                    handleChange={inputChange}
                    formgroupClass=''
                    isRequired={false}
                    type="text"
                    error=''
                    value={patientData.insurance}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <Input
                    Label="SSN"
                    placeholder="SSN"
                    name="SSN"
                    handleChange={inputChange}
                    formgroupClass=''
                    isRequired={false}
                    type="text"
                    error=''
                    value={patientData.SSN}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <label htmlFor="DOB">DOB</label>
                <ReactDatePicker
                    className={`form-control`}
                    placeholderText={"DOB"}
                    selected={patientData.DOB ? moment(patientData.DOB).toDate() : null}
                    // value={patientData.DOB ? moment(patientData.DOB).toDate() : null}
                    // disabled={isEditable === false}
                    onChange={(value) => inputChange({ target: { name: 'DOB', value } })}
                // isClearable
                // dateFormat="MMMM d, yyyy h:mm aa"
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <Input
                    Label="City"
                    placeholder="City"
                    name="city"
                    handleChange={inputChange}
                    formgroupClass=''
                    isRequired={false}
                    type="text"
                    error=''
                    value={patientData.city}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <Input
                    Label="Zip"
                    placeholder="Zip"
                    name="zip"
                    handleChange={inputChange}
                    formgroupClass=''
                    isRequired={false}
                    type="text"
                    error=''
                    value={patientData.zip}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-2">
                <label htmlFor="gender">Gender</label>
                <ReactSelect
                    className={`basic-single`}
                    classNamePrefix="select"
                    placeholder={`Select gender...`}
                    name={"gender"}
                    value={[patientData.gender ? CONST.GENDER_TYPE.find((i) => i.value === patientData.gender) : null]}
                    options={CONST.GENDER_TYPE}
                    onChange={(value) => inputChange({ target: { name: 'gender', value: value.value } })}
                    menuPlacement="auto"
                // isDisabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-2">
                <label htmlFor="maritalStatus">Marital status</label>
                <ReactSelect
                    className={`basic-single`}
                    classNamePrefix="select"
                    placeholder={`Marital status...`}
                    name={"maritalStatus"}
                    value={[patientData.maritalStatus ? CONST.MARITAL_TYPE.find((i) => i.value === patientData.maritalStatus) : null]}
                    options={CONST.MARITAL_TYPE}
                    onChange={(value) => inputChange({ target: { name: 'maritalStatus', value: value.value } })}
                    menuPlacement="auto"
                // isDisabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <Input
                    Label="Medical Record Number"
                    placeholder="Medical Record Number"
                    name="medicalRecordNumber"
                    handleChange={inputChange}
                    formgroupClass=''
                    isRequired={false}
                    type="text"
                    error=''
                    value={patientData.medicalRecordNumber}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
            <Col md={6} className="form-group mb-0">
                <label htmlFor="Admit-date">Admit Date</label>
                <ReactDatePicker
                    className={`form-control`}
                    placeholderText={"Date of Admit"}
                    selected={patientData.admitDate ? moment(patientData.admitDate).toDate() : null}
                    onChange={(value) => inputChange({ target: { name: 'admitDate', value } })}
                // disabled={!state.isNewPatient || updateData}
                />
            </Col>
        </Row>
    )
}

export const getPatients = async (value = "") => {
    const payload = await generatePayload({
        options: {
            populate: ["patientGuardians", "patientAssign", "lastAllocatedSlot", "facilityInfo"]
        },
        keys: ["firstName", "lastName", "middleName"],
        value
    });
    const data = await patientService.list({ payload });
    return data;
}