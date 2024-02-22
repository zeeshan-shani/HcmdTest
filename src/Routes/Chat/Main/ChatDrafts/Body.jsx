import React from 'react'
import { Tab, Tabs } from '@mui/material'
import Drafts from './Drafts'

export default function Body({ state, tabs, setState }) {
    return (<>
        <Tabs
            value={state.tab}
            onChange={(data, val) => setState(prev => ({ ...prev, tab: val }))}
        >
            {Object.values(tabs).map((item) => (
                <Tab key={item} className="text-capitalize bg-none" style={{ color: "var(--text-color)" }} value={item} label={item} />))
            }
        </ Tabs>
        {state.tab === tabs[0] && <Drafts />}
        {state.tab === tabs[1] && <Drafts scheduled={true} />}
        {state.tab === tabs[2] && <Drafts sent={true} />}
    </>
    )
}
