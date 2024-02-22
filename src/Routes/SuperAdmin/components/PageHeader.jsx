import React from 'react'

export default function PageHeader({ title = '', options }) {
    return (
        <div className="card shadow-none dash-card">
            <div className="card-header d-flex flex-wrap align-items-center border-0">
                <h5 className="card-title mb-0">{title}</h5>
                {options &&
                    <div className="heading-elements ml-auto">
                        {options}
                    </div>}
            </div>
        </div>
    )
}
