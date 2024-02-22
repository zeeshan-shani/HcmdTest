import { CONST } from "utils/constants";

export const TASK_STATUS = [
	{ id: 0, value: "All" },
	...CONST.TASK_STATUS
];

export const ALL_LABELS = [
	{
		id: 1,
		name: "Label 1",
		color: "primary",
	},
	{
		id: 2,
		name: "Label 2",
		color: "danger",
	},
	{
		id: 3,
		name: "Label 3",
		color: "info",
	},
	{
		id: 4,
		name: "Label 4",
		color: "warning",
	},
	{
		id: 5,
		name: "Label 5",
		color: "secondary",
	},
	{
		id: 6,
		name: "Label 6",
		color: "success",
	},
];
