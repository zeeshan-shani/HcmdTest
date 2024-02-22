import styled from "styled-components";

export const Switch = styled.div`
	position: relative;
	height: 36px;
	width: 180px;
	background-color: #c8c8c8;
	border-radius: 3px;
	box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.1);
`;

export const SwitchRadio = styled.input`
	display: none;
`;

export const SwitchSelection = styled.span`
	display: block;
	position: absolute;
	z-index: 1;
	top: 0px;
	left: 0px;
	width: 59px;
	height: 36px;
	background: #665dfe;
	border-radius: 3px;
	transition: left 0.25s ease-out;
`;

export const SwitchLabel = styled.label`
	position: relative;
	z-index: 2;
	float: left;
	width: 59px;
	line-height: 36px;
	font-size: 14px;
	color: rgba(0, 0, 0, 0.6);
	text-align: center;
	cursor: pointer;

	${SwitchRadio}:checked {
		color: #fff;
	}

	${SwitchRadio}:checked + & {
		transition: 0.15s ease-out;
		color: rgba(255, 255, 255, 0.9);
	}
`;
