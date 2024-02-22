import moment from 'moment-timezone';
import ReactDatePicker from 'react-datepicker';
import { ClockHistory, FunnelFill, SortAlphaDown, SortAlphaUp } from 'react-bootstrap-icons';
import { CONST } from 'utils/constants';
import { MuiTooltip } from 'Components/components';
import classes from "Routes/TaskBoard/TasksPage.module.css";
import { compareByName } from 'Routes/Chat/Main/UserChat/info/group-chat-info/GroupChatInfo';

export const TodoFilters = ({
    filters,
    filterChange,
    sortMethod,
    sortingMethods,
    setFilters,
    taskCategories
}) => {
    const onChangeFilter = (val) => filterChange({ filterTask: val })

    return (<>
        <div className="appnavbar-heading sticky-top p-0">
            <div className='accordion text-color'>
                <div className={`${classes["accordion-item"]} task-card-item ${classes["todos"]} shadow-none`}>
                    <div
                        className="accordion-button collapsed cursor-pointer d-flex justify-content-between"
                        data-bs-toggle="collapse"
                        data-bs-target={`#panelsStayOpen-collapse-filters`}
                        aria-expanded="false"
                        aria-controls={`panelsStayOpen-collapse-filters`}
                    >
                        <div className={`${classes.title} d-flex align-items-center mb-1`}>
                            <p className='mb-0'>Filters
                                <span className='ml-1'><FunnelFill /></span>
                            </p>
                        </div>
                    </div>
                    <div id={`panelsStayOpen-collapse-filters`} className={`accordion-collapse collapse show`} aria-labelledby={`card-filter`}>
                        <div className="accordion-body">
                            <div className={`${classes["board-card-scroll"]} overflow-unset`}>
                                <ul className="nav justify-content-between align-items-center">
                                    <li className="text-center">
                                        <div className="input-group mr-2">
                                            <input
                                                type="text"
                                                className="form-control search"
                                                placeholder="Search task"
                                                onChange={(e) => filterChange({ search: e.target.value })} />
                                        </div>
                                    </li>
                                    <li className="text-center">
                                        <div className="toggle_chat">
                                            <div className="dropdown">
                                                <button className="btn btn-outline-default custom-dropdown dropdown-toggle text-capitalize" id="typeFilterDropdown" data-bs-toggle="dropdown" type="button">
                                                    {Object.values(CONST.FILTER_TASK_TYPE).map(i => i).find(i => i.value === filters.filterTask).label2 || "Task"}
                                                </button>
                                                <ul className="dropdown-menu m-0 todo-dd" style={{ minWidth: '8rem' }} aria-labelledby="typeFilterDropdown">
                                                    {[CONST.FILTER_TASK_TYPE.ASSIGNEE, CONST.FILTER_TASK_TYPE.CREATOR, CONST.FILTER_TASK_TYPE.ALL, CONST.FILTER_TASK_TYPE.CHAT_TASK]
                                                        .map((item, index) => (
                                                            <li key={index} className="dropdown-item" onClick={() => onChangeFilter(item.value)}>{item.label2}</li>
                                                        ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                                {/* <div className="dropdown mt-1">
                                    <button
                                        className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown text-truncate"
                                        type="button"
                                        style={{ maxWidth: "200px" }}
                                        id="cateoryDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        title="Filter by category"
                                    >
                                        <span>Category: {filters.category ? filters.category.name : "N/A"}</span>
                                    </button>
                                    <ul className="dropdown-menu position-absolute m-0" aria-labelledby="statusDropdown">
                                        <li
                                            className="dropdown-item cursor-pointer text-capitalize"
                                            onClick={() => filterChange({ category: null })}
                                        >
                                            {"None"}
                                        </li>
                                        {categories
                                            .sort(compareByName)
                                            .map((category) => (
                                                <li
                                                    key={category.id}
                                                    className="dropdown-item cursor-pointer text-capitalize"
                                                    onClick={() => filterChange({ category })}
                                                >
                                                    {category.name || "unknown"}
                                                </li>
                                            ))}
                                    </ul>
                                </div> */}
                                <div className="dropdown mt-1">
                                    <button
                                        className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown text-truncate d-flex align-items-center"
                                        type="button"
                                        style={{ maxWidth: "250px" }}
                                        id="cateoryDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        title="Filter by category"
                                    >
                                        {filters.category &&
                                            <div className='color-dot mr-1' style={filters.category.colorCode ?
                                                { background: filters.category.colorCode } : {}} />}
                                        {filters.category ?
                                            `${filters.category.name || "unknown"}`
                                            : "Select Category"}
                                    </button>
                                    <ul className="dropdown-menu position-absolute m-0" aria-labelledby="statusDropdown">
                                        <li className="dropdown-item cursor-pointer text-capitalize"
                                            onClick={() => filterChange({ category: null })}>
                                            {"All"}
                                        </li>
                                        {taskCategories
                                            .sort(compareByName)
                                            .map((category) => (
                                                <li
                                                    key={category.id}
                                                    className="dropdown-item cursor-pointer text-capitalize text-truncate"
                                                    onClick={() => filterChange({ category: category })}
                                                >
                                                    <div className='color-dot mr-1' style={category.colorCode ?
                                                        { background: category.colorCode } : {}} />
                                                    {category.name || "unknown"}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                                <ul className="nav justify-content-between align-items-center mt-1">
                                    <li>
                                        <MuiTooltip title='Date Ranges'>
                                            <div className="input-group d-flex px-0 flex-nowrap w-auto cstm-datepicker">
                                                <ReactDatePicker
                                                    selectsRange={true}
                                                    startDate={filters.dateFrom ? new Date(filters.dateFrom) : null}
                                                    endDate={filters.dateTo ? new Date(filters.dateTo) : null}
                                                    placeholderText="Select Dates"
                                                    className="form-control search mr-3"
                                                    onChange={(update) => {
                                                        const [a, b] = update;
                                                        filterChange({ dateFrom: a ? moment(a).toLocaleString() : null, dateTo: b ? moment(b).toLocaleString() : null })
                                                    }}
                                                    isClearable={true}
                                                />
                                            </div>
                                        </MuiTooltip>
                                    </li>
                                    <li className='d-flex'>
                                        <div className="dropdown mr-2">
                                            <button className="btn btn-outline-default dropdown-toggle text-capitalize custom-dropdown" id="TodoDropdown" data-bs-toggle="dropdown" type="button">
                                                {filters.status ? filters.status : "All"}
                                            </button>
                                            <ul className="dropdown-menu m-0 todo-dd" style={{ minWidth: '8rem' }} aria-labelledby="TodoDropdown">
                                                <li className="dropdown-item" onClick={() => filterChange({ status: "" })}>All</li>
                                                {CONST.TASK_STATUS.map((item, index) => (
                                                    <li
                                                        key={index}
                                                        className="dropdown-item"
                                                        onClick={() => filterChange({ status: item.value })}
                                                    >
                                                        {item.value}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <MuiTooltip
                                            // title={ ? 'Sort by Ascending Order' : 'Sort by Descending Order'}
                                            title={`Sort by ${sortMethod.label} Order`}
                                        >
                                            <div className="btn btn-sm btn-outline-default custom-dropdown d-flex align-items-center"
                                                onClick={() => setFilters(prev => ({ ...prev, sortMethod: sortingMethods[(prev.sortMethod.id + 1) % 3] }))}>
                                                {sortMethod.value === sortingMethods[0].value && <ClockHistory size={20} />}
                                                {sortMethod.value === sortingMethods[1].value && <SortAlphaUp size={20} />}
                                                {sortMethod.value === sortingMethods[2].value && <SortAlphaDown size={20} />}
                                            </div>
                                        </MuiTooltip>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}