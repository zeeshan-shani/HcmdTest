import React, { forwardRef, useCallback } from 'react'
import { MuiTooltip } from 'Components/components'
import { Check, TagFill } from "react-bootstrap-icons";
import taskCategoryService from 'services/APIs/services/taskCategoryService';
import { useQuery } from '@tanstack/react-query';
import { CONST } from 'utils/constants';
import { ReactComponent as Loader } from 'assets/media/messageLoader.svg';

const TaskCategorySelect = forwardRef(function TaskCategorySelect(props, ref) {
    const { taskDetails, setTaskDetails, labelMenu, setLabelMenu, isTemplate } = props;

    const { data: taskCategories = [], isFetching } = useQuery({
        queryKey: ["/taskCategory/list"],
        queryFn: async () => {
            const data = await taskCategoryService.list({});
            if (data?.status === 1) return data.data
            return [];
        },
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L1,
    });
    const categoryField = isTemplate ? "templateCategories" : "messageTaskCategories"
    const categoryFieldInfo = isTemplate ? "templateCategoryInfo" : "categoryInfo"

    const labelSelectHandler = useCallback((label) => {
        if (!taskDetails[categoryField]?.filter((item) => item.categoryId === label.id).length)
            setTaskDetails((prev) => ({
                ...prev,
                [categoryField]: [{ categoryId: label.id, [categoryFieldInfo]: label }].concat(prev[categoryField] ? prev[categoryField] : [])
            }));
        else
            setTaskDetails((prev) => ({
                ...prev,
                [categoryField]: prev[categoryField].filter((lab) => lab.categoryId !== label.id),
            }));
    }, [taskDetails, setTaskDetails, categoryField, categoryFieldInfo]);

    return (
        <MuiTooltip title='Category'>
            <div className="icon">
                <div title="Add Tags" className="dropdown m-0 show">
                    <div className="cursor-pointer" onClick={() => setLabelMenu(!labelMenu)}>
                        <TagFill size={20} />
                    </div>
                    {labelMenu &&
                        <ul className="dropdown-menu dropdown-menu-right text-light m-1 show" ref={ref}>
                            {isFetching ? <Loader height={'80px'} /> :
                                taskCategories.map((label) => (
                                    <li key={label.id} className={`dropdown-item text-${label.color} justify-content-between`} onClick={() => labelSelectHandler(label)}>
                                        <div className='d-flex align-items-center'>
                                            <div className='color-dot mr-1' style={label.colorCode ?
                                                { background: label.colorCode } : {}} />
                                            <div>{label?.name}</div>
                                        </div>
                                        {!!(taskDetails[categoryField])?.filter((item) => item.categoryId === label.id).length ? (<Check size={16} />) : ("")}
                                    </li>
                                ))
                            }
                        </ul>}
                </div>
            </div>
        </MuiTooltip>
    );
});

export default TaskCategorySelect;