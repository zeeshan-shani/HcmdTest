import React from 'react'
import { Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import classes from "Routes/TaskBoard/TasksPage.module.css";

export default function MessageCategory({ item }) {
    const { user } = useSelector(state => state.user);
    if (!item?.messageTaskCategories?.length) return;
    return (
        <div className='my-1'>
            <div className='message-footer d-flex align-items-center justify-content-between flex-wrap'>
                <div className={`${classes["status-block"]} m-0 d-flex flex-wrap gap-5`}>
                    {(item?.messageTaskCategories?.map((category) => {
                        const { name = "", colorCode, id } = category.categoryInfo;
                        if (name)
                            return (
                                <Badge bg={user.themeMode === "dark" ? "secondary" : "light"} className={`d-flex p-1 gap-5 text-color text-capitalize`} key={id}>
                                    {/* style={{ backgroundColor: colorCode || '#000', margin: "4px 4px", padding: "2px" }} */}
                                    <div className='color-circle-sm' style={colorCode ?
                                        { background: colorCode } : {}} />
                                    {name}
                                </Badge>)
                        return null;
                    }))}
                </div>
            </div>
        </div>
    )
}
