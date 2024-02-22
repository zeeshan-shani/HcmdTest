// import React from 'react';
// import { Switch, SwitchLabel, SwitchRadio, SwitchSelection } from './styles';

// const titleCase = str =>
//     str.split(/\s+/).map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

// const ClickableLabel = ({ title, onChange, selected }) =>
//     <SwitchLabel onClick={() => onChange(title)} className={`mb-0 font-inherit ${selected === title ? 'text-white' : ''}`}>
//         {titleCase(title)}
//     </SwitchLabel>;

// const ConcealedRadio = ({ value, selected }) =>
//     <SwitchRadio type="radio" name="switch" checked={selected === value} onChange={() => { }} />;

// export const StateToggle = ({ values = [], selected = null, OnChange, isCreator = false }) => {
//     const handleChange = val => {
//         // OnChange(val === COMPLETE_STATES[0] ? false : true);
//     };
//     const selectionStyle = () => {
//         return {
//             left: `${values.indexOf(selected) / values.length * 100}%`,
//         };
//     };
//     return (
//         <Switch className={`input-border ${!isCreator ? 'disable-click opacity-80' : ''}`}>
//             {values.map(val => {
//                 return (
//                     <span key={val}>
//                         <ConcealedRadio value={val} selected={selected} />
//                         <ClickableLabel title={val} selected={selected} onChange={handleChange} />
//                     </span>
//                 );
//             })}
//             <SwitchSelection style={selectionStyle()} />
//         </Switch>
//     )
// }
