"use strict";(self.webpackChunkhcmd_communication=self.webpackChunkhcmd_communication||[]).push([[72],{9072:(i,o,e)=>{e.r(o),e.d(o,{default:()=>u});var l=e(99584),n=e(62005),s=e(86808),d=e(66651),t=e(84920),a=e(77184),r=e(44328),c=e(97884);function u(i){var o,e,u,p,v;let{popupData:m}=i;const[h,x]=(0,l.useState)(null),[j,b]=(0,l.useState)(1);return(0,c.jsx)(c.Fragment,{children:(0,c.jsxs)("div",{className:"chat-content position-relative ".concat(null!==m&&void 0!==m&&null!==(o=m.mediaType)&&void 0!==o&&o.startsWith("application/pdf")?"":"d-flex align-items-center"),style:{backgroundColor:"rgba(0,0,0,.3)"},children:[(0,c.jsx)("div",{className:"container",children:(0,c.jsxs)("div",{className:"col-12 px-0",children:[(null===m||void 0===m||null===(e=m.mediaType)||void 0===e?void 0:e.startsWith(a.o.MEDIA_TYPE.IMAGE))&&(0,c.jsx)("img",{src:null===m||void 0===m?void 0:m.mediaUrl,alt:""}),(null===m||void 0===m||null===(u=m.mediaType)||void 0===u?void 0:u.startsWith(a.o.MEDIA_TYPE.VIDEO))&&(0,c.jsxs)("video",{width:"100%",controls:!0,children:[(0,c.jsx)("source",{src:null===m||void 0===m?void 0:m.mediaUrl,type:"video/mp4"}),(0,c.jsx)("source",{src:null===m||void 0===m?void 0:m.mediaUrl,type:"video/ogg"}),"Your browser does not support the video tag."]}),(null===m||void 0===m||null===(p=m.mediaType)||void 0===p?void 0:p.startsWith("application/pdf"))&&(0,c.jsx)(r.a8,{loading:(0,c.jsx)(n._,{height:"80px"}),file:null===m||void 0===m?void 0:m.mediaUrl,options:{workerSrc:"/pdf.worker.js"},onLoadError:i=>(0,t.u)("Error while loading document!"),onLoadSuccess:i=>{let{numPages:o}=i;x(o)},children:(0,c.jsx)("div",{className:"my-1",children:Array.from(new Array(h),((i,o)=>(0,c.jsx)(r.K2,{scale:j,loading:(0,c.jsx)("div",{children:"Loading page..."}),pageNumber:o+1},"page_".concat(o+1))))})})]})}),(null===m||void 0===m||null===(v=m.mediaType)||void 0===v?void 0:v.startsWith("application/pdf"))&&(0,c.jsxs)("div",{className:"position-absolute pdf-zoom_in_out",children:[(0,c.jsx)("button",{type:"button",className:"btn btn-info p-4_8 border-0 mr-1",onClick:()=>b((i=>i+.2)),children:(0,c.jsx)(s.c,{size:18})}),(0,c.jsx)("button",{type:"button",className:"btn btn-info p-4_8 border-0",onClick:()=>b((i=>i-.2)),children:(0,c.jsx)(d.c,{size:18})})]})]})})}}}]);