import React from "react";
import { MuiTooltip } from "Components/components";
import { IconButton } from "@mui/material";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import TodayIcon from "@mui/icons-material/Today";
// import ViewDayIcon from "@mui/icons-material/ViewDay";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const CalendarHeader = (toolbar) => {
	const goToBack = () => {
		if (toolbar.view === "month") toolbar.date.setMonth(toolbar.date.getMonth() - 1);
		if (toolbar.view === "day") toolbar.date.setDate(toolbar.date.getDate() - 1);
		if (toolbar.view === "week") toolbar.date.setDate(toolbar.date.getDate() - 7);
		if (toolbar.view === "work_week") toolbar.date.setDate(toolbar.date.getDate() - 5);
		toolbar.onNavigate("prev");
	};

	const goToNext = () => {
		if (toolbar.view === "day") toolbar.date.setDate(toolbar.date.getDate() + 1);
		if (toolbar.view === "month") toolbar.date.setMonth(toolbar.date.getMonth() + 1);
		if (toolbar.view === "week") toolbar.date.setDate(toolbar.date.getDate() + 7);
		if (toolbar.view === "work_week") toolbar.date.setDate(toolbar.date.getDate() + 5);
		toolbar.onNavigate("next");
	};

	const goToCurrent = () => {
		const now = new Date();
		toolbar.date.setDate(now.getDate());
		toolbar.date.setMonth(now.getMonth());
		toolbar.date.setYear(now.getFullYear());
		toolbar.onNavigate("current");
		toolbar.onView("day");
	};

	return (
		<div className="calender-toolbar-container">
			<div className="filter-container d-flex justify-content-between">
				<div className="flex-1 fs-20 bold-text title">Calendar</div>
				<div>
					<MuiTooltip id={`today`} title={"Today"} placement="bottom">
						<IconButton onClick={goToCurrent}>
							<TodayIcon className="text-primary" />
						</IconButton>
					</MuiTooltip>
					{/* <MuiTooltip id={`day`} title={"Day"} placement="bottom">
						<IconButton onClick={() => toolbar.onView("day")}>
							<TodayIcon />
						</IconButton>
					</MuiTooltip> */}
					<MuiTooltip id={`month`} title={"Month"} placement="bottom">
						<IconButton onClick={() => toolbar.onView("month")}>
							<CalendarMonthIcon />
						</IconButton>
					</MuiTooltip>
					<MuiTooltip id={`week`} title={"Week"} placement="bottom">
						<IconButton onClick={() => toolbar.onView("week")}>
							<DateRangeIcon />
						</IconButton>
					</MuiTooltip>
					<MuiTooltip id={`workweek`} title={"Work Week"} placement="bottom">
						<IconButton onClick={() => toolbar.onView("work_week")}>
							<ViewWeekIcon />
						</IconButton>
					</MuiTooltip>
					{/* <MuiTooltip id={`agenda`} title={"Agenda"} placement="bottom">
						<IconButton onClick={() => toolbar.onView("agenda")}>
							<ViewDayIcon />
						</IconButton>
					</MuiTooltip> */}
				</div>
			</div>
			<div className="navigation-buttons">
				<div>
					<MuiTooltip id={`previous`} title={"Previous"} placement="bottom">
						<IconButton onClick={goToBack}>
							<ArrowBackIosNewIcon />
						</IconButton>
					</MuiTooltip>
				</div>
				<div className="label-date">
					<h5>
						<b>{toolbar.label}</b>
					</h5>
				</div>
				<div>
					<MuiTooltip id={`next`} title={"Next"} placement="bottom">
						<IconButton onClick={goToNext}>
							<ArrowForwardIosIcon />
						</IconButton>
					</MuiTooltip>
				</div>
			</div>
		</div>
	);
};
export default CalendarHeader;
