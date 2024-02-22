export const menuStyle = {
	control: {
		fontSize: 14,
		fontWeight: "normal",
	},

	"&singleLine": {
		display: "inline-block",
		width: 180,
		highlighter: {
			color: "#665dfe !important",
		},
	},

	suggestions: {
		list: {
			fontSize: 14,
		},
		item: {
			padding: "5px 15px",
			borderBottom: "1px solid rgba(0,0,0,0.15)",
			"&focused": {
				backgroundColor: "#665dfe",
			},
		},
	},
};
