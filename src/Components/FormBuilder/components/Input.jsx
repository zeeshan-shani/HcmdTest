import React from 'react'

export default function Input({
    formgroupClass = '',
    rootClassName = "",
    name = '',
    Label = '',
    isRequired = false,
    type = "text",
    error = '', handleChange, handleBlur, value, disabled = false, ref = null,
    autoFocus = false, placeholder = '', id, className = '', autoComplete = 'off', inputProps = {}, onkeydown = () => { }
}) {

    const propsInputComp = {
        type,
        name,
        className: `form-control ${className}, `,
        id,
        placeholder: placeholder ? placeholder : Label,
        onChange: handleChange,
        onKeyDown: onkeydown,
        onBlur: handleBlur,
        value: value ? value : '',
        disabled,
        ref: ref,
        required: isRequired,
        autoFocus: autoFocus,
        autoComplete: autoComplete,
        ...inputProps
    }
    return (
        <div className={`form-group d-flex flex-column ${rootClassName}`}>
            {Label &&
                <label htmlFor={name}>
                    {Label}
                    {isRequired && <span className="small text-danger">*</span>}
                </label>}
            {type === "textarea" ?
                <textarea {...propsInputComp} /> :
                <input {...propsInputComp} />}
            {error && <p className="error">{error}</p>}
        </div>
    )
}
