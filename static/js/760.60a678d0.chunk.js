"use strict";(self.webpackChunkhcmd_communication=self.webpackChunkhcmd_communication||[]).push([[760],{41100:(e,i,l)=>{l.d(i,{Y:()=>h});const o=class{constructor(){this.defaultValue={text:"button",name:"button",type:"primary"}}onChange(e){}};const n=class{constructor(){this.defaultValue={id:"",name:"label",label:"Label Class",value:"text label"}}onChange(e){}};const t=class{constructor(){this.defaultValue={label:"Number input field"}}onChange(e){}};const d=class{constructor(){this.defaultValue={label:"password field"}}onChange(e){}};const a=class{constructor(){this.defaultValue={label:"Radio Label",name:"radio",value:"",defaultValue:"",options:[{label:"option 1",value:"option1"}]}}onChange(e){}};const s=class{constructor(){this.defaultValue={label:"Select",name:"selectField",value:[],description:"",options:[{label:"option 1",value:"option1"}]}}onChange(e){}};const c=class{constructor(){this.defaultValue={label:"Textarea",name:"textareaField",placeholder:"Type something here",rows:3,description:"",prefix:"",suffix:"",autoComplete:"",autoFocus:[],isEditable:[],defaultValue:"",value:""}}onChange(e){}};const u=class{constructor(){this.defaultValue={label:"Text Input",name:"textField",placeholder:"Type here",description:"",tooltip:"",prefix:"",suffix:"",autoComplete:"",autoFocus:[],isEditable:[],defaultValue:"",value:""}}onChange(e){}};const r=class{constructor(){this.defaultValue={label:"Signature",name:"signatureField",description:"",value:""}}onChange(e){}};const _=class{constructor(){this.defaultValue={label:"Date Label",value:"",name:"datefield",placeholder:"Enter date",isClearable:!1,timeRequired:!1}}onChange(e){}};const v=class{constructor(){this.defaultValue={label:"Checkbox",name:"checkbox",value:"",defaultValue:"",options:[{label:"option 1",value:"option1"}]}}onChange(e){}};const m=class{constructor(){this.defaultValue={name:"Image",placeholder:"Type here",tooltip:"",method:"static",imageURL:"",defaultValue:"",value:"",style:{height:100,width:100}}}onChange(e){}},h=e=>{let{type:i,position:l,id:h,style:p={},nodeData:f={},output:x={}}=e,b={id:h||"dndnode_".concat(Date.now()),type:i,position:l,output:x,style:p,data:{label:"".concat(i," node")}};switch(i){case"LabelNode":const e=new n;b.data={...b.data,...e.defaultValue,...f,onChange:e.onChange};break;case"TextFieldNode":const i=new u;b.data={...b.data,...i.defaultValue,...f,onChange:i.onChange};break;case"TextAreaNode":const l=new c;b.data={...b.data,...l.defaultValue,...f,onChange:l.onChange};break;case"NumberNode":const h=new t;b.data={...b.data,...h.defaultValue,...f,onChange:h.onChange};break;case"ButtonNode":const p=new o;b.data={...b.data,...p.defaultValue,...f,onChange:p.onChange};break;case"PasswordNode":const x=new d;b.data={...b.data,...x.defaultValue,...f,onChange:x.onChange};break;case"CheckBoxNode":const E=new v;b.data={...b.data,...E.defaultValue,...f,onChange:E.onChange};break;case"RadioNode":const N=new a;b.data={...b.data,...N.defaultValue,...f,onChange:N.onChange};break;case"SelectNode":const g=new s;b.data={...b.data,...g.defaultValue,...f,onChange:g.onChange};break;case"DateTimeNode":const j=new _;b.data={...b.data,...j.defaultValue,...f,onChange:j.onChange};break;case"SignatureNode":const C=new r;b.data={...b.data,...C.defaultValue,...f,onChange:C.onChange};break;case"ImageNode":const w=new m;b.data={...b.data,...w.defaultValue,...f,onChange:w.onChange}}return b}},63312:(e,i,l)=>{l.d(i,{c:()=>s});var o=l(99584),n=l(74284),t=l(47148),d=l(80248),a=l(97884);function s(e){let{show:i,data:l,setInputField:s,nodeId:c}=e;const{setNodes:u}=(0,d.Pb)(),r=(0,d.YT)(),_=(0,o.useCallback)((()=>{u(r.filter((e=>e.id!==c)))}),[c,r,u]);return(0,a.jsxs)("div",{className:"component-btn-group action-controller ".concat(i?"":"visibility-hidden"),children:[(0,a.jsx)("div",{className:"btn-secondary component-settings-button",role:"button",children:(0,a.jsx)(n.c,{style:{fontSize:"14px"}})}),(0,a.jsx)("div",{className:"btn-danger component-settings-button nodrag",role:"button",onClick:_,children:(0,a.jsx)(t.c,{style:{fontSize:"14px"}})})]})}},21488:(e,i,l)=>{l.d(i,{c:()=>u});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(75448),c=l(97884);const u=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:o}=(0,n.Pb)(),{id:u,selected:r,setInputField:_,rendered:v=!1,output:m}=e,h=(0,n.YT)(),p=o(u),{data:f}=p,[x,b]=(0,d.c)((e=>{var i;return(0,c.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(e&&!v?"hovered":""),children:[!v&&(0,c.jsx)(a.c,{show:!0,nodeId:u,setNodes:l,setInputField:_}),!v&&(0,c.jsx)(t.OK,{color:"#ff0071",isVisible:r,minWidth:100,minHeight:57}),(0,c.jsx)("div",{className:"form-inline p-1",children:(0,c.jsx)(s.c,{className:"w-100",variant:(null===f||void 0===f||null===(i=f.type[0])||void 0===i?void 0:i.value)||"primary",children:f.text})})]})}));if(!m||null===(i=p.output)||void 0===i||!i.hasOwnProperty("visibility")||p.output.visibility){if(f.conditional&&v){var E,N,g,j,C;const e=!(null===h||void 0===h||!h.length)&&(null===f||void 0===f||null===(E=f.conditional)||void 0===E?void 0:E.when)&&(null===h||void 0===h||null===(N=h.find((e=>e.id===f.conditional.when)))||void 0===N||null===(g=N.data)||void 0===g?void 0:g.value);if("true"===f.conditional.show&&e!==(null===f||void 0===f||null===(j=f.conditional)||void 0===j?void 0:j.eq)||"false"===f.conditional.show&&e===(null===f||void 0===f||null===(C=f.conditional)||void 0===C?void 0:C.eq))return(0,c.jsx)("div",{})}return(0,c.jsx)("div",{className:"".concat(""),children:x})}}))},93976:(e,i,l)=>{l.d(i,{c:()=>u});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(18282),c=l(97884);const u=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:u}=(0,n.Pb)(),r=(0,n.YT)(),{selected:_,setInputField:v,rendered:m=!1,id:h,output:p}=e,[f,x]=(0,o.useState)([]),b=u(h),{data:E}=b,N=(0,o.useCallback)((e=>{m&&l(r.map((i=>(i.id===h&&(i.data={...i.data,value:e}),i))))}),[h,l,r,m]);(0,o.useEffect)((()=>{m&&N(f)}),[f]);const[g,j]=(0,d.c)((i=>{var o;return(0,c.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(i&&!m?"hovered":""),children:[!m&&(0,c.jsx)(a.c,{show:!0,nodeId:h,setNodes:l,setInputField:v}),!m&&(0,c.jsx)(t.OK,{color:"#ff0071",isVisible:_,minWidth:100,minHeight:57}),(0,c.jsx)("div",{className:"form-inline p-1",children:(0,c.jsxs)("div",{className:"text-left",children:[(0,c.jsx)(s.c.Label,{children:null===E||void 0===E?void 0:E.label}),null!==E&&void 0!==E&&E.options&&E.options.length?null===E||void 0===E||null===(o=E.options)||void 0===o?void 0:o.map(((i,l)=>{var o;return(0,c.jsx)(s.c.Check,{type:"checkbox",inline:!0,id:"".concat(e.id,"-").concat(l),name:h,label:i.label,className:"d-flex justify-content-start gap-10",checked:f.includes(i.value),disabled:!(null===E||void 0===E||null===(o=E.isEditable)||void 0===o||!o.length)&&"false"===(null===E||void 0===E?void 0:E.isEditable[0]),onChange:e=>{e.target.checked?x((e=>[...e,i.value])):e.target.checked||x((e=>e.filter((e=>e!==i.value))))}},i.value)})):(0,c.jsx)(s.c.Text,{as:"p",className:"text-muted",children:"No options"})]})})]})}));if(!p||null===(i=b.output)||void 0===i||!i.hasOwnProperty("visibility")||b.output.visibility){if(E.conditional&&m){var C,w,O,P,D;const e=!(null===r||void 0===r||!r.length)&&(null===E||void 0===E||null===(C=E.conditional)||void 0===C?void 0:C.when)&&(null===r||void 0===r||null===(w=r.find((e=>e.id===E.conditional.when)))||void 0===w||null===(O=w.data)||void 0===O?void 0:O.value);if("true"===E.conditional.show&&e!==(null===E||void 0===E||null===(P=E.conditional)||void 0===P?void 0:P.eq)||"false"===E.conditional.show&&e===(null===E||void 0===E||null===(D=E.conditional)||void 0===D?void 0:D.eq))return(0,c.jsx)("div",{})}return(0,c.jsx)("div",{className:"".concat(""),children:g})}}))},65312:(e,i,l)=>{l.d(i,{c:()=>m});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(59648),c=l.n(s),u=l(18282),r=l(49280),_=l.n(r),v=l(97884);const m=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:s}=(0,n.Pb)(),r=(0,n.YT)(),{id:m,selected:h,setInputField:p,rendered:f=!1,output:x}=e,b=s(m),{data:E}=b,[N,g]=(0,o.useState)(E.value||""),j=(0,o.useCallback)((e=>{f&&l(r.map((i=>(i.id===m&&(i.data={...i.data,value:e?_()(e).format():""}),i))))}),[m,l,r,f]);(0,o.useEffect)((()=>{f&&j(N)}),[N,f]);const[C,w]=(0,d.c)((e=>{var i,o;return(0,v.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(e&&!f?"hovered":""),children:[!f&&(0,v.jsx)(a.c,{show:!0,nodeId:m,setNodes:l,setInputField:p}),!f&&(0,v.jsx)(t.OK,{color:"#ff0071",isVisible:h,minWidth:100,minHeight:57}),(0,v.jsx)("div",{className:"form-inline",children:(0,v.jsxs)("div",{className:"input-group theme-border w-100 p-1",children:[(0,v.jsx)(u.c.Label,{children:E.label||""}),(0,v.jsx)(c(),{className:"form-control w-100",placeholderText:E.placeholder,selected:N,disabled:!1===E.isEditable,onChange:e=>{!1!==E.isEditable&&g(e)},isClearable:!(null===E||void 0===E||null===(i=E.isClearable)||void 0===i||!i.length)&&"true"===(null===E||void 0===E?void 0:E.isClearable[0]),showTimeSelect:!(null===E||void 0===E||null===(o=E.showTime)||void 0===o||!o.length)&&"true"===E.showTime[0],timeFormat:"HH:mm",autoComplete:"off",timeIntervals:15,dateFormat:"MMMM d, yyyy h:mm aa",timeCaption:"time"})]})})]})}));if(!x||null===(i=b.output)||void 0===i||!i.hasOwnProperty("visibility")||b.output.visibility){if(E.conditional&&f){var O,P,D,M,I;const e=!(null===r||void 0===r||!r.length)&&(null===E||void 0===E||null===(O=E.conditional)||void 0===O?void 0:O.when)&&(null===r||void 0===r||null===(P=r.find((e=>e.id===E.conditional.when)))||void 0===P||null===(D=P.data)||void 0===D?void 0:D.value);if("true"===E.conditional.show&&e!==(null===E||void 0===E||null===(M=E.conditional)||void 0===M?void 0:M.eq)||"false"===E.conditional.show&&e===(null===E||void 0===E||null===(I=E.conditional)||void 0===I?void 0:I.eq))return(0,v.jsx)("div",{})}return(0,v.jsx)("div",{className:"".concat(""),children:C})}}))},3836:(e,i,l)=>{l.d(i,{c:()=>u});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(88220),c=l(97884);const u=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:u}=(0,n.Pb)(),r=(0,n.YT)(),{selected:_,setInputField:v,rendered:m=!1,id:h,output:p}=e,f=u(h),{data:x}=f,b=(0,o.useCallback)(((e,i)=>{let{height:o,width:n}=i;l(r.map((e=>(e.id===h&&(e.data={...e.data,style:{height:o,width:n}}),e))))}),[h,r,l]),[E,N]=(0,d.c)((e=>(0,c.jsxs)("div",{className:"cstm-field-edit-border cstm-form-input-field m-1 ".concat(e&&!m?"hovered":""),style:x.style,children:[!m&&(0,c.jsx)(a.c,{show:!0,nodeId:h,setNodes:l,setInputField:v}),!m&&(0,c.jsx)(t.OK,{color:"#ff0071",isVisible:_,onResizeEnd:b,minWidth:100,minHeight:57}),(0,c.jsx)("div",{className:"overflow-hidden",style:x.style,children:(0,c.jsx)("img",{src:(0,s.ch)(x.imageURL),style:x.style,alt:""})})]})));if(!p||null===(i=f.output)||void 0===i||!i.hasOwnProperty("visibility")||f.output.visibility){if(x.conditional&&m){var g,j,C,w,O;const e=!(null===r||void 0===r||!r.length)&&(null===x||void 0===x||null===(g=x.conditional)||void 0===g?void 0:g.when)&&(null===r||void 0===r||null===(j=r.find((e=>e.id===x.conditional.when)))||void 0===j||null===(C=j.data)||void 0===C?void 0:C.value);if("true"===x.conditional.show&&e!==(null===x||void 0===x||null===(w=x.conditional)||void 0===w?void 0:w.eq)||"false"===x.conditional.show&&e===(null===x||void 0===x||null===(O=x.conditional)||void 0===O?void 0:O.eq))return(0,c.jsx)("div",{})}return(0,c.jsx)("div",{className:"".concat(""),children:E})}}))},57127:(e,i,l)=>{l.d(i,{c:()=>c});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(97884);const c=(0,o.memo)((e=>{var i,l;const{setNodes:o,getNode:c}=(0,n.Pb)(),u=(0,n.YT)(),{selected:r,setInputField:_,rendered:v=!1,id:m,output:h}=e,p=c(m),{data:f}=p,[x,b]=(0,d.c)((i=>(0,s.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(i&&!v?"hovered":""),children:[!v&&(0,s.jsx)(a.c,{show:!0,setNodes:o,setInputField:_,nodeId:m}),!v&&(0,s.jsx)(t.OK,{color:"#ff0071",isVisible:r,minWidth:100,minHeight:57}),(0,s.jsx)("div",{className:"form-inline p-1",children:(0,s.jsx)("div",{className:"input-group theme-border w-100",children:(0,s.jsx)("div",{dangerouslySetInnerHTML:{__html:e.data.value||"Unknown label"}})})})]})));if((!h||null===(i=p.output)||void 0===i||!i.hasOwnProperty("visibility")||p.output.visibility)&&(h||null===f||void 0===f||null===(l=f.onlyOutput)||void 0===l||!l.length)){if(f.conditional&&v){var E,N,g,j,C;const e=!(null===u||void 0===u||!u.length)&&(null===f||void 0===f||null===(E=f.conditional)||void 0===E?void 0:E.when)&&(null===u||void 0===u||null===(N=u.find((e=>e.id===f.conditional.when)))||void 0===N||null===(g=N.data)||void 0===g?void 0:g.value);if("true"===f.conditional.show&&e!==(null===f||void 0===f||null===(j=f.conditional)||void 0===j?void 0:j.eq)||"false"===f.conditional.show&&e===(null===f||void 0===f||null===(C=f.conditional)||void 0===C?void 0:C.eq))return(0,s.jsx)("div",{})}return(0,s.jsx)("div",{className:"".concat(""),children:x})}}))},91152:(e,i,l)=>{l.d(i,{c:()=>c});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(97884);const c=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:o}=(0,n.Pb)(),c=(0,n.YT)(),{id:u,selected:r,setInputField:_,rendered:v=!1,output:m}=e,h=o(u),{data:p}=h,[f,x]=(0,d.c)((e=>(0,s.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(e&&!v?"hovered":""),children:[!v&&(0,s.jsx)(a.c,{show:!0,nodeId:u,setNodes:l,setInputField:_}),!v&&(0,s.jsx)(t.OK,{color:"#ff0071",isVisible:r,minWidth:100,minHeight:57}),(0,s.jsx)("div",{className:"form-inline",children:(0,s.jsx)("div",{className:"input-group theme-border w-100",children:(0,s.jsx)("input",{type:"number",className:"form-control search",title:p.label,onChange:e=>p.onChange(e.target.value),placeholder:p.label})})})]})));if(!m||null===(i=h.output)||void 0===i||!i.hasOwnProperty("visibility")||h.output.visibility){if(p.conditional&&v){var b,E,N,g,j;const e=!(null===c||void 0===c||!c.length)&&(null===p||void 0===p||null===(b=p.conditional)||void 0===b?void 0:b.when)&&(null===c||void 0===c||null===(E=c.find((e=>e.id===p.conditional.when)))||void 0===E||null===(N=E.data)||void 0===N?void 0:N.value);if("true"===p.conditional.show&&e!==(null===p||void 0===p||null===(g=p.conditional)||void 0===g?void 0:g.eq)||"false"===p.conditional.show&&e===(null===p||void 0===p||null===(j=p.conditional)||void 0===j?void 0:j.eq))return(0,s.jsx)("div",{})}return(0,s.jsx)("div",{className:"".concat(""),children:f})}}))},34408:(e,i,l)=>{l.d(i,{c:()=>c});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(97884);const c=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:o}=(0,n.Pb)(),c=(0,n.YT)(),{id:u,selected:r,setInputField:_,rendered:v=!1,output:m}=e,h=o(u),{data:p}=h,[f,x]=(0,d.c)((e=>(0,s.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(e&&!v?"hovered":""),children:[!v&&(0,s.jsx)(a.c,{show:!0,nodeId:u,setNodes:l,setInputField:_}),!v&&(0,s.jsx)(t.OK,{color:"#ff0071",isVisible:r,minWidth:100,minHeight:57}),(0,s.jsx)("div",{className:"form-inline p-1",children:(0,s.jsx)("div",{className:"input-group theme-border w-100",children:(0,s.jsx)("input",{type:"password",className:"form-control search",title:p.label,onChange:e=>p.onChange(e.target.value),placeholder:p.label})})})]})));if(!m||null===(i=h.output)||void 0===i||!i.hasOwnProperty("visibility")||h.output.visibility){if(p.conditional&&v){var b,E,N,g,j;const e=!(null===c||void 0===c||!c.length)&&(null===p||void 0===p||null===(b=p.conditional)||void 0===b?void 0:b.when)&&(null===c||void 0===c||null===(E=c.find((e=>e.id===p.conditional.when)))||void 0===E||null===(N=E.data)||void 0===N?void 0:N.value);if("true"===p.conditional.show&&e!==(null===p||void 0===p||null===(g=p.conditional)||void 0===g?void 0:g.eq)||"false"===p.conditional.show&&e===(null===p||void 0===p||null===(j=p.conditional)||void 0===j?void 0:j.eq))return(0,s.jsx)("div",{})}return(0,s.jsx)("div",{className:"".concat(""),children:f})}}))},89740:(e,i,l)=>{l.d(i,{c:()=>u});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(18282),c=l(97884);const u=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:u}=(0,n.Pb)(),r=(0,n.YT)(),{selected:_,setInputField:v,rendered:m=!1,id:h,output:p}=e,f=u(h),{data:x}=f,[b,E]=(0,o.useState)(x.value||""),N=(0,o.useCallback)((e=>{let[i]=e;m&&l(r.map((e=>(e.id===h&&(e.data={...e.data,value:i}),e))))}),[h,l,r,m]);(0,o.useEffect)((()=>{m&&N(b)}),[b,m]);const[g,j]=(0,d.c)((i=>{var o;return(0,c.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(i&&!m?"hovered":""),children:[!m&&(0,c.jsx)(a.c,{show:!0,nodeId:h,setNodes:l,setInputField:v}),!m&&(0,c.jsx)(t.OK,{color:"#ff0071",isVisible:_,minWidth:100,minHeight:57}),(0,c.jsx)("div",{className:"form-inline p-1",children:(0,c.jsxs)("div",{className:"text-left",children:[x.label&&(0,c.jsx)(s.c.Label,{children:x.label}),null===x||void 0===x||null===(o=x.options)||void 0===o?void 0:o.map(((i,l)=>{var o;return(0,c.jsx)(s.c.Check,{type:"radio",inline:!0,id:"".concat(e.id,"-").concat(l),name:h,label:i.label,className:"d-flex justify-content-start gap-10",checked:b.includes(i.value),disabled:!(null===x||void 0===x||null===(o=x.isEditable)||void 0===o||!o.length)&&"false"===(null===x||void 0===x?void 0:x.isEditable[0]),onChange:e=>{e.target.checked&&E((e=>[i.value]))}},i.value)})),(null===x||void 0===x?void 0:x.description)&&(0,c.jsx)(s.c.Text,{children:x.description})]})})]})}));if(!p||null===(i=f.output)||void 0===i||!i.hasOwnProperty("visibility")||f.output.visibility){if(x.conditional&&m){var C,w,O,P,D;const e=!(null===r||void 0===r||!r.length)&&(null===x||void 0===x||null===(C=x.conditional)||void 0===C?void 0:C.when)&&(null===r||void 0===r||null===(w=r.find((e=>e.id===x.conditional.when)))||void 0===w||null===(O=w.data)||void 0===O?void 0:O.value);if("true"===x.conditional.show&&e!==(null===x||void 0===x||null===(P=x.conditional)||void 0===P?void 0:P.eq)||"false"===x.conditional.show&&e===(null===x||void 0===x||null===(D=x.conditional)||void 0===D?void 0:D.eq))return(0,c.jsx)("div",{})}return(0,c.jsx)("div",{className:"".concat(""),children:g})}}))},91092:(e,i,l)=>{l.d(i,{c:()=>r});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(93164),c=l(18282),u=l(97884);const r=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:r}=(0,n.Pb)(),_=(0,n.YT)(),{selected:v,setInputField:m,id:h,rendered:p=!1,output:f}=e,x=r(h),{data:b}=x,[E,N]=(0,o.useState)(b.value||[]),g=(0,o.useCallback)((e=>{p&&l(_.map((i=>(i.id===h&&(i.data={...i.data,value:e}),i))))}),[h,l,_,p]);(0,o.useEffect)((()=>{p&&g(E)}),[E,p]);const[j,C]=(0,d.c)((e=>(0,u.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(e&&!p?"hovered":""),children:[!p&&(0,u.jsx)(a.c,{show:!0,nodeId:h,setNodes:l,setInputField:m}),!p&&(0,u.jsx)(t.OK,{color:"#ff0071",isVisible:v,minWidth:185,minHeight:57}),(0,u.jsx)("div",{className:"form-inline",children:(0,u.jsxs)("div",{className:"input-group theme-border w-100 p-1",children:[(0,u.jsx)(c.c.Label,{children:null===b||void 0===b?void 0:b.label}),(0,u.jsx)(s.cp,{value:[E],classNamePrefix:"select",placeholder:"Select Options",className:"min-width-160 w-100",name:b.name,options:(null===b||void 0===b?void 0:b.options)||[],onChange:e=>N(e),isClearable:!0}),(null===b||void 0===b?void 0:b.description)&&(0,u.jsx)(c.c.Text,{children:null===b||void 0===b?void 0:b.description})]})})]})));if(!f||null===(i=x.output)||void 0===i||!i.hasOwnProperty("visibility")||x.output.visibility){if(b.conditional&&p){var w,O,P,D,M;const e=!(null===_||void 0===_||!_.length)&&(null===b||void 0===b||null===(w=b.conditional)||void 0===w?void 0:w.when)&&(null===_||void 0===_||null===(O=_.find((e=>e.id===b.conditional.when)))||void 0===O||null===(P=O.data)||void 0===P?void 0:P.value);if("true"===b.conditional.show&&e!==(null===b||void 0===b||null===(D=b.conditional)||void 0===D?void 0:D.eq)||"false"===b.conditional.show&&e===(null===b||void 0===b||null===(M=b.conditional)||void 0===M?void 0:M.eq))return(0,u.jsx)("div",{})}return(0,u.jsx)("div",{className:"".concat(""),children:j})}}))},42100:(e,i,l)=>{l.d(i,{c:()=>m});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(26492),c=l.n(s),u=l(18282),r=l(63856),_=l(5604),v=l(97884);const m=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:s}=(0,n.Pb)(),m=(0,n.YT)(),{selected:h,setInputField:p,id:f,rendered:x=!1,output:b}=e,E=(0,o.useRef)(),N=s(f),{data:g}=N,[j,C]=(0,o.useState)(g.value||null),w=(0,o.useCallback)((()=>{C(E.current.toDataURL())}),[]),O=(0,o.useCallback)((e=>{x&&l(m.map((i=>(i.id===f&&(i.data={...i.data,value:e}),i))))}),[f,l,m,x]),P=(0,o.useCallback)((()=>{E.current.clear(),C(null)}),[]);(0,o.useEffect)((()=>{x&&O(j)}),[j,x]);const[D,M]=(0,d.c)((e=>(0,v.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(e&&!x?"hovered":""),children:[!x&&(0,v.jsx)(a.c,{show:!0,nodeId:f,setNodes:l,setInputField:p}),!x&&(0,v.jsx)(t.OK,{color:"#ff0071",isVisible:h,minWidth:100,minHeight:57}),(0,v.jsxs)("div",{className:"form-inline p-2",children:[(0,v.jsx)(u.c.Label,{children:g.label||""}),(0,v.jsxs)("div",{className:"input-group theme-border w-100 signature-wrapper position-relative",children:[x?(0,v.jsx)("div",{className:"signature",children:(0,v.jsx)(c(),{penColor:"green",ref:E,canvasProps:{className:"bg-light-color"},onEnd:w})}):(0,v.jsx)("div",{className:"bg-light-color",style:{height:"140px",width:"100%",minWidth:"300px"}}),(0,v.jsx)("div",{className:"position-absolute",style:{right:0,bottom:"100%"},children:(0,v.jsx)(r.S_,{Icon:_.c,size:"medium",onClick:P})})]}),(0,v.jsx)(u.c.Text,{children:g.description||""})]})]})));if(!b||null===(i=N.output)||void 0===i||!i.hasOwnProperty("visibility")||N.output.visibility){if(g.conditional&&x){var I,T,B,y,k;const e=!(null===m||void 0===m||!m.length)&&(null===g||void 0===g||null===(I=g.conditional)||void 0===I?void 0:I.when)&&(null===m||void 0===m||null===(T=m.find((e=>e.id===g.conditional.when)))||void 0===T||null===(B=T.data)||void 0===B?void 0:B.value);if("true"===g.conditional.show&&e!==(null===g||void 0===g||null===(y=g.conditional)||void 0===y?void 0:y.eq)||"false"===g.conditional.show&&e===(null===g||void 0===g||null===(k=g.conditional)||void 0===k?void 0:k.eq))return(0,v.jsx)("div",{})}return(0,v.jsx)("div",{className:"".concat(""),children:D})}}))},75452:(e,i,l)=>{l.d(i,{c:()=>f});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(18282),c=l(38232),u=l(61415),r=l(62380),_=l(66224),v=l(63856),m=l(16660),h=l(84920),p=l(97884);const f=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:f}=(0,n.Pb)(),x=(0,n.YT)(),{selected:b,setInputField:E,customClasses:N={},rendered:g=!1,id:j,output:C}=e,w=f(j),{data:O}=w,[P,D]=(0,o.useState)(O.value||""),M=(0,u.c)(P,500),I=(0,o.useCallback)((e=>{g&&l(x.map((i=>(i.id===j&&(i.data={...i.data,value:e}),i))))}),[j,l,x,g]);(0,o.useEffect)((()=>{g&&I(M)}),[M,g]);const T=(0,o.useCallback)((()=>{const e=O.calculated;try{let{value:i,isNull:l}=(0,r.calculateByExpression)({expression:e,nodes:x});i&&!l&&((0,_.Ir)(i)&&(i="".concat(Number(i).toFixed(2))),D(i))}catch(i){(0,h.u)("There is an error occured while calculating the value. Check the given expression: ".concat(e)),console.error(i)}}),[x,O]),[B,y]=(0,d.c)((e=>{var i,o;return(0,p.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(e&&!g?"hovered":""),children:[!g&&(0,p.jsx)(a.c,{show:!0,nodeId:j,setNodes:l,setInputField:E}),!g&&(0,p.jsx)(t.OK,{color:"#ff0071",isVisible:b,minWidth:100,minHeight:57}),(0,p.jsx)("div",{className:"form-inline",children:(0,p.jsxs)("div",{className:"text-left w-100 p-1",children:[""!==(null===O||void 0===O?void 0:O.label)&&(0,p.jsxs)(s.c.Label,{className:"".concat(N.label," d-flex justify-content-start mb-1"),children:[null===O||void 0===O?void 0:O.label,(null===O||void 0===O?void 0:O.isRequired)&&(0,p.jsx)("span",{className:"small text-danger",children:"*"})]}),(0,p.jsxs)(c.c,{className:"mb-0 d-flex",children:[(null===O||void 0===O?void 0:O.prefix)&&(0,p.jsx)(c.c.Text,{id:"".concat(O.id,"-prefix"),children:O.prefix}),(0,p.jsx)(s.c.Control,{value:P||"",as:"textarea",placeholder:O.placeholder?O.placeholder:O.label,className:"form-control",disabled:!(null===O||void 0===O||null===(i=O.isEditable)||void 0===i||!i.length)&&"false"===(null===O||void 0===O?void 0:O.isEditable[0]),autoComplete:null!==O&&void 0!==O&&O.autoComplete?null===O||void 0===O?void 0:O.autoComplete:void 0,autoFocus:!(null===O||void 0===O||null===(o=O.autoFocus)||void 0===o||!o.length)&&Boolean(null===O||void 0===O?void 0:O.autoFocus[0]),defaultValue:null!==O&&void 0!==O&&O.defaultValue?null===O||void 0===O?void 0:O.defaultValue:void 0,onChange:e=>{!1!==(null===O||void 0===O?void 0:O.isEditable)&&D(e.target.value)}}),(null===O||void 0===O?void 0:O.suffix)&&(0,p.jsx)(c.c.Text,{id:"".concat(j,"-suffix"),children:O.suffix}),O.calculated&&g&&(0,p.jsx)(v.S_,{Icon:m.c,onClick:T,tooltip:"Calculate value"})]}),(null===O||void 0===O?void 0:O.description)&&(0,p.jsx)(s.c.Text,{id:"".concat(j,"-description"),children:null===O||void 0===O?void 0:O.description}),(null===O||void 0===O?void 0:O.error)&&(0,p.jsx)(s.c.Text,{id:"".concat(j,"-error"),children:null===O||void 0===O?void 0:O.error})]})})]})}));if(!C||null===(i=w.output)||void 0===i||!i.hasOwnProperty("visibility")||w.output.visibility){if(O.conditional&&g){var k,L,R,W,A;const e=!(null===x||void 0===x||!x.length)&&(null===O||void 0===O||null===(k=O.conditional)||void 0===k?void 0:k.when)&&(null===x||void 0===x||null===(L=x.find((e=>e.id===O.conditional.when)))||void 0===L||null===(R=L.data)||void 0===R?void 0:R.value);if("true"===O.conditional.show&&e!==(null===O||void 0===O||null===(W=O.conditional)||void 0===W?void 0:W.eq)||"false"===O.conditional.show&&e===(null===O||void 0===O||null===(A=O.conditional)||void 0===A?void 0:A.eq))return(0,p.jsx)("div",{})}return(0,p.jsx)("div",{className:"".concat(""),children:B})}}))},52592:(e,i,l)=>{l.d(i,{c:()=>f});var o=l(99584),n=l(80248),t=l(34960),d=l(41560),a=l(63312),s=l(18282),c=l(38232),u=l(61415),r=l(63856),_=l(16660),v=l(66224),m=l(62380),h=l(84920),p=l(97884);const f=(0,o.memo)((e=>{var i;const{setNodes:l,getNode:f}=(0,n.Pb)(),x=(0,n.YT)(),{selected:b,setInputField:E,customClasses:N={},rendered:g=!1,id:j,output:C}=e,w=f(j),{data:O}=w,[P,D]=(0,o.useState)(O.value||""),M=(0,u.c)(P,500),I=(0,o.useCallback)((e=>{g&&l(x.map((i=>(i.id===j&&(i.data={...i.data,value:e}),i))))}),[j,l,x,g]);(0,o.useEffect)((()=>{g&&I(M)}),[M,g]);const T=(0,o.useCallback)((()=>{const e=O.calculated;try{let{value:i,isNull:l}=(0,m.calculateByExpression)({expression:e,nodes:x});i&&!l&&((0,v.Ir)(i)&&(i="".concat(Number(i).toFixed(2))),D(i))}catch(i){(0,h.u)("There is an error occured while calculating the value. Check the given expression: ".concat(e)),console.error(i)}}),[x,O]),[B,y]=(0,d.c)((i=>{var o,n;return(0,p.jsxs)("div",{className:"m-1 cstm-field-edit-border cstm-form-input-field ".concat(i&&!g?"hovered":""),children:[!g&&(0,p.jsx)(a.c,{show:!0,nodeId:j,setNodes:l,setInputField:E}),!g&&(0,p.jsx)(t.OK,{color:"#ff0071",isVisible:b,minWidth:100,minHeight:57}),(0,p.jsx)("div",{className:"form-inline p-1",children:(0,p.jsxs)("div",{className:"text-left w-100",children:[""!==(null===O||void 0===O?void 0:O.label)&&!C&&(0,p.jsxs)(s.c.Label,{className:"".concat(N.label," d-flex justify-content-start mb-1"),children:[null===O||void 0===O?void 0:O.label,(null===O||void 0===O?void 0:O.isRequired)&&(0,p.jsx)("span",{className:"small text-danger",children:"*"})]}),(0,p.jsxs)(c.c,{className:"mb-0 d-flex",children:[(null===O||void 0===O?void 0:O.prefix)&&(0,p.jsx)(c.c.Text,{id:"".concat(O.id,"-prefix"),children:O.prefix}),(0,p.jsx)(s.c.Control,{value:P||"",type:"text",placeholder:O.placeholder?O.placeholder:O.label,className:"form-control",disabled:!(null===O||void 0===O||null===(o=O.isEditable)||void 0===o||!o.length)&&"false"===(null===O||void 0===O?void 0:O.isEditable[0]),autoComplete:null!==O&&void 0!==O&&O.autoComplete?null===O||void 0===O?void 0:O.autoComplete:void 0,autoFocus:!(null===O||void 0===O||null===(n=O.autoFocus)||void 0===n||!n.length)&&Boolean(null===O||void 0===O?void 0:O.autoFocus[0]),defaultValue:null!==O&&void 0!==O&&O.defaultValue?null===O||void 0===O?void 0:O.defaultValue:void 0,onChange:e=>{!1!==(null===O||void 0===O?void 0:O.isEditable)&&("number"===(null===O||void 0===O?void 0:O.inputType)?null===O||void 0===O||O.onChange(Number(e.target.value)):D(e.target.value))}}),(null===O||void 0===O?void 0:O.suffix)&&(0,p.jsx)(c.c.Text,{id:"".concat(O.id,"-suffix"),children:O.suffix}),O.calculated&&g&&(0,p.jsx)(r.S_,{Icon:_.c,onClick:T,tooltip:"Calculate value"})]}),(null===O||void 0===O?void 0:O.description)&&(0,p.jsx)(s.c.Text,{id:"".concat(null===e||void 0===e?void 0:e.id,"-description"),children:null===O||void 0===O?void 0:O.description}),(null===O||void 0===O?void 0:O.error)&&(0,p.jsx)(s.c.Text,{id:"".concat(null===e||void 0===e?void 0:e.id,"-error"),children:null===O||void 0===O?void 0:O.error})]})})]})}));if(!C||null===(i=w.output)||void 0===i||!i.hasOwnProperty("visibility")||w.output.visibility){if(O.conditional&&g){var k,L,R,W,A;const e=!(null===x||void 0===x||!x.length)&&(null===O||void 0===O||null===(k=O.conditional)||void 0===k?void 0:k.when)&&(null===x||void 0===x||null===(L=x.find((e=>e.id===O.conditional.when)))||void 0===L||null===(R=L.data)||void 0===R?void 0:R.value);if("true"===O.conditional.show&&e!==(null===O||void 0===O||null===(W=O.conditional)||void 0===W?void 0:W.eq)||"false"===O.conditional.show&&e===(null===O||void 0===O||null===(A=O.conditional)||void 0===A?void 0:A.eq))return(0,p.jsx)("div",{})}return(0,p.jsx)("div",{className:"".concat(""),children:B})}}))},62380:(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{calculateByExpression:()=>calculateByExpression,default:()=>FormRenderer});var react__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__(99584),reactflow__WEBPACK_IMPORTED_MODULE_16__=__webpack_require__(80248),services_helper__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__(66224),services_hooks_useDebounce__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__(61415),_Builder_custom_components_inputs_ButtonNode__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__(21488),_Builder_custom_components_inputs_CheckBoxNode__WEBPACK_IMPORTED_MODULE_4__=__webpack_require__(93976),_Builder_custom_components_inputs_DateTimeNode__WEBPACK_IMPORTED_MODULE_5__=__webpack_require__(65312),_Builder_custom_components_inputs_ImageNode__WEBPACK_IMPORTED_MODULE_6__=__webpack_require__(3836),_Builder_custom_components_inputs_LabelNode__WEBPACK_IMPORTED_MODULE_7__=__webpack_require__(57127),_Builder_custom_components_inputs_NumberNode__WEBPACK_IMPORTED_MODULE_8__=__webpack_require__(91152),_Builder_custom_components_inputs_PasswordNode__WEBPACK_IMPORTED_MODULE_9__=__webpack_require__(34408),_Builder_custom_components_inputs_RadioNode__WEBPACK_IMPORTED_MODULE_10__=__webpack_require__(89740),_Builder_custom_components_inputs_SelectNode__WEBPACK_IMPORTED_MODULE_11__=__webpack_require__(91092),_Builder_custom_components_inputs_SignatureNode__WEBPACK_IMPORTED_MODULE_12__=__webpack_require__(42100),_Builder_custom_components_inputs_TextAreaNode__WEBPACK_IMPORTED_MODULE_13__=__webpack_require__(75452),_Builder_custom_components_inputs_TextField__WEBPACK_IMPORTED_MODULE_14__=__webpack_require__(52592),_Builder_Services_NodeBuilder__WEBPACK_IMPORTED_MODULE_17__=__webpack_require__(41100),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__=__webpack_require__(97884);function FormRenderer(e){let{onChange:i=(()=>{}),form:l,height:o}=e;const n=(0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null),t=JSON.parse(localStorage.getItem("formNodes"))||[],[d,a,s]=(0,reactflow__WEBPACK_IMPORTED_MODULE_16__.wn)(l.components||t),c=(0,services_hooks_useDebounce__WEBPACK_IMPORTED_MODULE_2__.c)(d,500);(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{null!==c&&void 0!==c&&c.length&&localStorage.setItem("formNodes",JSON.stringify([])),i({components:c})}),[c,i]),(0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)((()=>{const e=l.components&&l.components.map((e=>(0,_Builder_Services_NodeBuilder__WEBPACK_IMPORTED_MODULE_17__.Y)({id:e.id,type:e.type,position:e.position,nodeData:e.data})));a(e||t)}),[a]);const u=(0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)((()=>({LabelNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_LabelNode__WEBPACK_IMPORTED_MODULE_7__.c,{...e,rendered:!0}),TextFieldNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_TextField__WEBPACK_IMPORTED_MODULE_14__.c,{...e,rendered:!0}),TextAreaNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_TextAreaNode__WEBPACK_IMPORTED_MODULE_13__.c,{...e,rendered:!0}),NumberNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_NumberNode__WEBPACK_IMPORTED_MODULE_8__.c,{...e,rendered:!0}),ButtonNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_ButtonNode__WEBPACK_IMPORTED_MODULE_3__.c,{...e,rendered:!0}),PasswordNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_PasswordNode__WEBPACK_IMPORTED_MODULE_9__.c,{...e,rendered:!0}),SelectNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_SelectNode__WEBPACK_IMPORTED_MODULE_11__.c,{...e,rendered:!0}),RadioNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_RadioNode__WEBPACK_IMPORTED_MODULE_10__.c,{...e,rendered:!0}),CheckBoxNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_CheckBoxNode__WEBPACK_IMPORTED_MODULE_4__.c,{...e,rendered:!0}),DateTimeNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_DateTimeNode__WEBPACK_IMPORTED_MODULE_5__.c,{...e,rendered:!0}),ImageNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_ImageNode__WEBPACK_IMPORTED_MODULE_6__.c,{...e,rendered:!0}),SignatureNode:e=>(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(_Builder_custom_components_inputs_SignatureNode__WEBPACK_IMPORTED_MODULE_12__.c,{...e,rendered:!0})})),[]),{pageHeight:r=0}=(0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)((()=>{let e={pageHeight:2e3};if(null!==c&&void 0!==c&&c.length){const i=Math.min(...c.map((e=>{var i;return null===(i=e.position)||void 0===i?void 0:i.y})))||2e3,l=Math.max(...c.map((e=>{var i;return null===(i=e.position)||void 0===i?void 0:i.y})))||2e3;e={pageHeight:Number((l-i).toFixed(0))+1e3}}return e}),[c]);return(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div",{className:"hcmd-form-builder form-renderer",children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div",{className:"form-canvas w-100",style:{height:null!==o&&void 0!==o?o:"85vh",maxWidth:1200},children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(reactflow__WEBPACK_IMPORTED_MODULE_16__.Mt,{children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)("div",{className:"reactflow-wrapper h-100 bg-light",ref:n,children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__.jsx)(reactflow__WEBPACK_IMPORTED_MODULE_16__.UX,{nodes:d,onNodesChange:s,style:{background:"#fff"},nodeTypes:u,defaultViewport:{x:0,y:0,zoom:1},nodesDraggable:!1,nodesFocusable:!0,draggable:!1,zoomOnScroll:!1,zoomOnPinch:!1,zoomOnDoubleClick:!1,panOnDrag:!1,panOnScroll:!0,proOptions:{hideAttribution:!0},translateExtent:[[0,0],[1200,r]]})})})})})}const calculateByExpression=_ref2=>{let{expression:expression,nodes:nodes}=_ref2;const variableNames=[...new Set(expression.match(/[a-zA-Z_]+/g))];let modifiedExp=expression,isAnyNull=!1;if(null===variableNames||void 0===variableNames||!variableNames.length)return;let fieldNameValues=variableNames.map((e=>{var i;if(!e)return{name:e,value:""};const l=null===(i=nodes.find((i=>i.data.name===e)))||void 0===i?void 0:i.data;return l&&l.value?{name:e,value:l.value}:{name:e,value:""}}));for(const e of variableNames){let i=fieldNameValues.find((i=>i.name===e)).value||"";i=i.trim(),modifiedExp=modifiedExp.replaceAll(e,(0,services_helper__WEBPACK_IMPORTED_MODULE_1__.Ir)(i)?"".concat(Number(i)||0):"'".concat(String(i)||"","'")),i||(isAnyNull=!0)}if(!isAnyNull){let value="".concat(eval(modifiedExp))||"";return(0,services_helper__WEBPACK_IMPORTED_MODULE_1__.Ir)(value)&&(value="".concat(Number(value).toFixed(0))),{value:value,isNull:isAnyNull}}return{isNull:isAnyNull}}}}]);