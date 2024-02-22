import React, { useCallback } from "react";
import { MuiTooltip } from "Components/components";
import { IconButton } from "@mui/material";
// import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import TodayIcon from "@mui/icons-material/Today";
// import ViewDayIcon from "@mui/icons-material/ViewDay";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const CalendarHeader = (toolbar) => {
    const goToBack = useCallback(() => {
        if (toolbar.view === "month") toolbar.date.setMonth(toolbar.date.getMonth() - 1);
        if (toolbar.view === "day") toolbar.date.setDate(toolbar.date.getDate() - 1);
        if (toolbar.view === "week") toolbar.date.setDate(toolbar.date.getDate() - 7);
        // if (toolbar.view === "work_week") toolbar.date.setDate(toolbar.date.getDate() - 5);
        toolbar.onNavigate("prev");
    }, [toolbar]);

    const goToNext = useCallback(() => {
        if (toolbar.view === "day") toolbar.date.setDate(toolbar.date.getDate() + 1);
        if (toolbar.view === "month") toolbar.date.setMonth(toolbar.date.getMonth() + 1);
        if (toolbar.view === "week") toolbar.date.setDate(toolbar.date.getDate() + 7);
        // if (toolbar.view === "work_week") toolbar.date.setDate(toolbar.date.getDate() + 5);
        toolbar.onNavigate("next");
    }, [toolbar]);

    const goToCurrent = useCallback(() => {
        const now = new Date();
        toolbar.date.setDate(now.getDate());
        toolbar.date.setMonth(now.getMonth());
        toolbar.date.setYear(now.getFullYear());
        toolbar.onNavigate("current");
        toolbar.onView("day");
    }, [toolbar]);

    return (
        <div className="calender-toolbar-container">
            <div className="filter-container d-flex justify-content-between">
                <div className="flex-1 fs-20 bold-text title">Calendar</div>
                <div>
                    {[
                        { id: "day", title: "day", Icon: TodayIcon, onClickEvent: goToCurrent },
                        { id: "month", title: "Month", Icon: CalendarMonthIcon, onClickEvent: () => toolbar.onView("month") },
                        { id: "week", title: "Week", Icon: DateRangeIcon, onClickEvent: () => toolbar.onView("week") },
                    ].map((Item, index) => (
                        <MuiTooltip id={Item.id} title={Item.title} placement="bottom" key={index}>
                            <IconButton onClick={Item.onClickEvent}>
                                <Item.Icon className={`${toolbar.view === Item.id ? "text-primary" : "text-muted"}`} />
                            </IconButton>
                        </MuiTooltip>
                    ))}
                    {/* <MuiTooltip id={`month`} title={"Month"} placement="bottom">
                        <IconButton onClick={() => toolbar.onView("month")}>
                            <CalendarMonthIcon />
                        </IconButton>
                    </MuiTooltip>
                    <MuiTooltip id={`week`} title={"Week"} placement="bottom">
                        <IconButton onClick={() => toolbar.onView("week")}>
                            <DateRangeIcon />
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
