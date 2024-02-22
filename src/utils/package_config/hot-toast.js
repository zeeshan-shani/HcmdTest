/**
 * This file contains code for displaying custom toasts using the react-hot-toast library.
 * It includes functions for displaying comments in tasks, task alerts, and internet connectivity status.
 * The file also imports various dependencies and components from different libraries.
 */

import toast from "react-hot-toast";
import { getTaskDetails } from "redux/actions/taskAction";
import { format_all, wait } from "redux/common";
import SignalWifiStatusbar4BarIcon from '@mui/icons-material/SignalWifiStatusbar4Bar';
import SignalWifiConnectedNoInternet4Icon from "@mui/icons-material/SignalWifiConnectedNoInternet4";
import { MuiActionButton } from "Components/MuiDataGrid";
import { Close, ImportExport } from "@mui/icons-material";
import { Alert, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";

/**
 * Displays a custom toast for new comments in a task.
 * @param {Object} data - The data object containing information about the comment.
 */
export const cmmtUpdateToast = (data) => {
	const taskId = data.data.taskId;
	const cmt = data.data.text;
	const textMessage = data?.data?.subTaskId ? `Subtask: ${data.data?.title}` : cmt;
	toast(
		(t) => (
			<div className={`${t.visible ? "animate-enter" : "animate-leave"} d-flex notify-comment bg-white`}>
				<div className="d-flex p-2 align-items-center">
					<div className="d-flex align-items-center image-div">
						<img className="hw-50 rounded-full" src={data.data?.user?.profilePicture} alt="" />
					</div>
					<div className="ml-2 d-flex align-items-center">
						<div>
							<p className="mb-0 font-weight-bold fs-14 text-truncate">
								{data.data?.user?.name}
							</p>
							<p className="mb-0 text-truncate">{textMessage}</p>
							{data?.data?.subTaskId && (
								<p className="mb-0 text-truncate">{cmt}</p>
							)}
						</div>
					</div>
				</div>
				<div className="d-flex p-2 align-items-center">
					<MuiActionButton Icon={ImportExport} tooltip={"Sync with task"} onClick={() => {
						// TODO - isDepartment: item?.isDepartment, 
						getTaskDetails({ taskId });
						toast.dismiss(t.id);
					}} />
					<MuiActionButton Icon={Close} tooltip="Close" onClick={() => toast.dismiss(t.id)} />
				</div>
			</div>
		),
		{ duration: 10000 }
	);
};

const alertType = [
	{ type: "TASK_ALERT", title: "Task Alert" },
	{ type: "MESSAGE_REMAINDER", title: "Message Reminder" },
];

/**
 * Displays a custom toast for task alerts.
 * @param {Object} data - The data object containing information about the task alert.
 */
export const customTaskAlertToast = ({ data }) => {
	const alert = alertType.find(i => i.type === data?.type);
	if (!alert) return;
	toast((t) => {
		let props = {
			message: <div dangerouslySetInnerHTML={{ __html: format_all(data.title) }} />,
			description: <div className="text-truncate in-one-line"
				dangerouslySetInnerHTML={{
					__html: format_all(data.subject ? data.subject : (data.message))
				}} />,
		};
		if (alert.type === "TASK_ALERT") {
			props = {
				...props,
				type: "info",
				action: <TaskActions tId={t.id} />,
			};
		} else if (alert.type === "MESSAGE_REMAINDER") {
			props = {
				...props,
				action: <ReminderActions tId={t.id} />,
			};
		}
		return (
			<Alert
				{...props}
				style={{ margin: "-4px -10px" }}
				showIcon
			/>
		);
	}, {
		id: data.type,
		duration: 99999999999,
		className: "p-0",
	});
};

/**
 * Component for displaying actions in a reminder toast.
 * @param {string} tId - The ID of the toast.
 */
const ReminderActions = ({ tId }) => {
	return (
		<Space className="mx-2" direction="horizontal">
			{/* <Button size="small" type="primary" onClick={() => {
        toast.dismiss(tId);
      }}>
        View Message
      </Button> */}
			<Button size="small" type="primary" onClick={() => toast.dismiss(tId)}>
				Close
			</Button>
		</Space>
	);
};

/**
 * Component for displaying actions in a task alert toast.
 * @param {string} tId - The ID of the toast.
 */
const TaskActions = ({ tId }) => {
	const navigate = useNavigate();
	return (
		<Space className="mx-2" direction="vertical">
			<Button size="small" type="primary" onClick={() => {
				navigate("/tasks");
				toast.dismiss(tId);
			}}>
				View Task
			</Button>
			<Button size="small" type="ghost" onClick={() => toast.dismiss(tId)}>
				Close
			</Button>
		</Space>
	);
};

/**
 * Displays a toast for internet connectivity status when connected.
 */
export const showConnectInternet = () => {
	const delay = 1000;
	toast.remove("internet-disconnect");
	toast.remove("internet-reconnects");
	toast((t) => {
		setTimeout(() => toast.dismiss(t.id), 1000);
		return (
			<div className="d-flex justify-content-center align-items-center" onClick={() => toast.dismiss(t.id)}>
				<SignalWifiStatusbar4BarIcon className="mx-2 text-success" />
				{'Connected to the Internet'}
			</div>
		);
	}, { duration: delay, id: "internet-disconnect" });
	wait(delay, () => {
		toast.dismiss("internet-reconnects");
		toast.remove("internet-reconnects");
	});
};

/**
 * Displays a toast for internet connectivity status when disconnected.
 */
export const showDisconnectInternet = () => {
	const delay = 1000 * 60 * 10;
	toast.remove("internet-disconnect");
	toast.remove("internet-reconnects");
	toast((t) => {
		setTimeout(() => toast.dismiss(t.id), 1000 * 60 * 10);
		return (
			<div className="d-flex justify-content-center align-items-center" onClick={() => toast.dismiss(t.id)}>
				<SignalWifiConnectedNoInternet4Icon className="mx-2 text-danger" />
				{"No Internet Access! Can't connect to the internet"}
			</div>
		);
	}, { duration: delay, id: "internet-disconnect" });
	wait(delay, () => {
		toast.dismiss("internet-disconnect");
		toast.remove("internet-disconnect");
	});
};