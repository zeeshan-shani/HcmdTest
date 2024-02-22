import styled from "styled-components";

// background-color: #c8c8c8;
// box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px rgba(255, 255, 255, 0.1);
export const Switch = styled.div`
	position: relative;
	height: 36px;
	width: 172px;
	border-radius: 3px;
	border: 1px solid var(--input-border);
	background: var(--input-border);
`;

export const SwitchRadio = styled.input`
	display: none;
`;

export const SwitchLabel = styled.label`
	position: relative;
	z-index: 2;
	float: left;
	width: 56px;
	line-height: 36px;
	font-size: 14px;
	color: var(--text-color);
	text-align: center;
	cursor: pointer;
	text-transform: capitalize;

	${SwitchRadio}:checked {
		color: #fff;
	}

	${SwitchRadio}:checked + & {
		transition: 0.15s ease-out;
		color: rgba(255, 255, 255, 0.9);
	}
`;

export const SwitchSelection = styled.span`
	display: block;
	position: absolute;
	z-index: 1;
	top: 0px;
	left: 0px;
	width: 57px;
	height: 35px;
	background: var(--theme-color);
	border-radius: 3px;
	transition: left 0.25s ease-out;
`;
