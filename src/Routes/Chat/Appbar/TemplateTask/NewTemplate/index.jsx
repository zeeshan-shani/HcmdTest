import React, { useCallback, useEffect, useRef, useState } from 'react'
import * as yup from "yup";
import { Formik } from 'formik';
import { Button, Row } from 'react-bootstrap';
import Input from 'Components/FormBuilder/components/Input';
import ReactSelect from 'react-select';
import ReactDatePicker from 'react-datepicker';
import { isString } from 'lodash';
import { Switch } from 'antd';

export const repeatOptions = [
    { "label": "None", "value": '0' },
    { "label": "Every Day", "value": '1' },
    { "label": "Every Week", "value": '7' },
    { "label": "Every Month", "value": '30' },
    { "label": "Every Year", "value": '365' },
    { "label": "Custom", "value": 1 },
];

const taskType = [
    { "label": "Routine", "value": "routine" },
    { "label": "Urgent", "value": "urgent" },
    { "label": "Emergency", "value": "emergency" }
]
export const visibility = {
    PUBLIC: { "label": "Public", "value": "public" },
    PRIVATE: { "label": "Private", "value": "private" },
}

const templateFormSchema = yup.object().shape({
    subject: yup.string().required("Subject is a required field"),
    description: yup.string().required("Description is a required field"),
    type: yup.string().default(taskType[0].value).oneOf(taskType.map(i => i.value), 'Invalid option selected').required('Select a valid type'),
    // repeat: yup.string().default([repeatOptions[0].value]).oneOf(repeatOptions.map(i => i.value), 'Invalid option selected').required('Select a valid option'),
    // repeatDate: yup.date().nullable().typeError('Invalid date format'),
    // endDate: yup.date().nullable().typeError('Invalid date format'),
});

export default function NewTemplate({ onClose, onSubmit }) {
    const subject = useRef(null);
    const submitBtn = useRef(null);
    const [state, setState] = useState({
        loading: false, error: null,
        repeat: repeatOptions[0].value,
        frequency: null,
        repeatEnd: null,
        visibility: visibility.PRIVATE
    });

    useEffect(() => subject?.current?.focus(), []);

    const submitHandler = useCallback((data) => {
        submitBtn.current.disabled = true;
        let body = {
            ...data,
            repeat: state.frequency,
            endRepeat: state.repeatEnd,
            isPublic: state.visibility?.value === visibility.PUBLIC.value
        }
        onSubmit(body);
        submitBtn.current.disabled = false;
    }, [state.frequency, state.repeatEnd, onSubmit, state.visibility?.value]);

    return (<>
        <Formik
            validationSchema={templateFormSchema}
            initialValues={{ subject: "", description: "", type: taskType[0].value, }}
            onSubmit={submitHandler}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
            }) => (
                <form className="mb-1 text-left" onSubmit={handleSubmit} noValidate>
                    {state.error && <p className="text-left mb-1 text-danger">{state.error}</p>}
                    <div className="form-group">
                        <label htmlFor={'subject'}>
                            Subject<span className="small text-danger">*</span>
                        </label>
                        <input
                            type={'text'}
                            name={'subject'}
                            className={`form-control form-control-md ${(errors.subject && touched.subject) || state.error ? 'border-danger' : ''}`}
                            id="task_subject"
                            placeholder="Enter subject"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.subject}
                            disabled={state.loading}
                            ref={subject}
                            required
                        />
                        <p className="error">{errors.subject && touched.subject && errors.subject}</p>
                    </div>
                    <Input
                        Label='Description'
                        name='description'
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        className={`form-control form-control-md  ${(errors.description && touched.description) || state.error ? 'border-danger' : ''}`}
                        error={errors.description && touched.description && errors.description}
                        id="task_description"
                        placeholder="Enter description"
                        value={values.description}
                        disabled={state.loading}
                        isRequired={true}
                    />
                    <div className="form-group">
                        <label htmlFor="type">Task type
                            <span className="small text-danger">*</span>
                        </label>
                        <div className='d-flex gap-5 align-items-center'>
                            {taskType.map((item, index) => (
                                <div className='mr-2 d-flex align-items-center' key={index}>
                                    <input type="radio" value={item.value} id={index} className='mr-1' name={'type'} checked={values.type === item.value}
                                        onChange={handleChange} onBlur={handleBlur} />
                                    <label htmlFor={index} className='cursor-pointer mb-0'>{item.label}</label>
                                </div>))}
                        </div>
                        <p className="error">{errors.type && touched.type && errors.type}</p>
                    </div>
                    <div className="form-group d-flex gap-10 mb-1">
                        <label htmlFor="type">Visibility: </label>
                        <Switch
                            className='outline-none'
                            unCheckedChildren={visibility.PRIVATE.label}
                            checkedChildren={visibility.PUBLIC.label}
                            checked={state.visibility.value === visibility.PUBLIC.value}
                            onChange={val => setState(prev => ({ ...prev, visibility: val ? visibility.PUBLIC : visibility.PRIVATE }))}
                        />
                    </div>
                    {state.visibility.value !== visibility.PUBLIC.value &&
                        <RepeatTemplateFields state={state} setState={setState} />}
                    <div className='gap-5'>
                        <Button variant='secondary' onClick={onClose}>Cancel</Button>
                        <Button ref={submitBtn} variant='primary' disabled={state.loading} type="submit">{!state.loading ? 'Submit' : 'Submitting...'}</Button>
                    </div>
                </form>
            )}
        </Formik>
    </>)
}

export const RepeatTemplateFields = ({ state, setState }) => {
    return (<>
        <Row>
            <div className={`form-group col-md-6`}>
                <label htmlFor={'repeat'}>
                    Repeat<span className="small text-danger">*</span>
                </label>
                <ReactSelect
                    name="repeat"
                    options={repeatOptions}
                    value={[repeatOptions.find(i => i.value === state.repeat)]}
                    placeholder={'Repeat Frequency...'}
                    onChange={e => setState(prev => ({ ...prev, repeat: e.value, frequency: e.value }))}
                    menuPlacement='auto'
                    className="basic-multi-select input-border"
                    classNamePrefix="select"
                />
            </div>
            <div className="form-group col-md-6">
                <label htmlFor={'frequency'}>
                    Repeat Frequency (in Days)
                </label>
                <input
                    type={'number'}
                    name={'frequency'}
                    className={`form-control form-control-md`}
                    id="task_repeatDuration"
                    placeholder="Enter repeat frequency"
                    min={1}
                    onChange={e => setState(prev => ({ ...prev, frequency: e.target.value }))}
                    value={!Number.isNaN(parseInt(state.frequency)) ? state.frequency : 0}
                    disabled={state.loading || isString(state.repeat)}
                    required
                    autoFocus
                />
            </div>
        </Row>
        <div className="form-group">
            <label htmlFor={'repeatEnd'}>
                Repeat End
            </label>
            <ReactDatePicker
                id="task_endrepeat"
                name="repeatEnd"
                placeholderText="End Repeat"
                className="form-control flex-grow-1 bg-dark-f p-4_8 input-border text-color font-inherit"
                selected={state.repeatEnd ? new Date(state.repeatEnd) : null}
                value={state.repeatEnd ? new Date(state.repeatEnd) : null}
                onChange={(date) => setState(prev => ({ ...prev, repeatEnd: date }))}
                isClearable={true}
                dateFormat="MM/dd/yyyy h:mm aa"
                autoComplete='off'
                showTimeSelect
            />
        </div>
    </>)
}