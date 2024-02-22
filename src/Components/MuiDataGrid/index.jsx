import React, { useCallback, useState } from 'react'
import moment from 'moment-timezone';
import Pagination from '@mui/material/Pagination';
import { MuiTooltip } from 'Components/components';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import { Close } from '@mui/icons-material';

/**
 * Renders the footer section of a MuiDataGrid.
 * @param {boolean} isFetching - Indicates if data is being fetched.
 * @param {string} lastUpdated - Timestamp of the last update.
 * @param {object} pagination - Object containing pagination details.
 * @param {function} onPageChange - Callback function for page change event.
 * @returns {JSX.Element|null} The MuiDataGrid footer component.
 */
export function MuiDataGridFooter({ isFetching, lastUpdated, pagination = false, onPageChange }) {
    if (pagination.total < pagination.pageSize) return null;
    return (
        <div className='d-flex justify-content-between flex-wrap mt-1 align-items-center'>
            <p className='mb-0'>
                {isFetching ? 'Updating...' : lastUpdated &&
                    window.innerWidth >= 567 ? `Last Updated ${moment().fromNow()}` : ''}
            </p>
            {pagination &&
                <CustomPagination pagination={pagination} onPageChange={onPageChange} />}
        </div>
    );
}

/**
 * Renders a custom pagination component.
 * @param {object} pagination - Object containing pagination details.
 * @param {function} onPageChange - Callback function for page change event.
 * @returns {JSX.Element} The custom pagination component.
 */
export function CustomPagination({ pagination, onPageChange }) {
    return (
        <Pagination
            color="primary"
            className='d-inline-flex'
            count={(pagination.total && pagination.pageSize) ? Math.ceil((pagination.total / pagination.pageSize)) : 0}
            page={pagination.page}
            onChange={onPageChange}
        />
    );
}

/**
 * Renders a Material-UI action button with a tooltip.
 * @param {string} tooltip - Tooltip text for the button.
 * @param {string} size - Size of the button.
 * @param {string} fontSize - Font size of the button icon.
 * @param {string} color - Color of the button.
 * @param {function} onClick - Callback function for button click event.
 * @param {JSX.Element} Icon - Icon component to be rendered inside the button.
 * @param {string} className - Additional CSS class for the button.
 * @returns {JSX.Element} The Material-UI action button component.
 */
export function MuiActionButton({ tooltip = "", size = "medium", fontSize = "regular", color = "primary", onClick = () => { }, Icon, className = "" }) {
    return (
        <MuiTooltip title={tooltip}>
            <IconButton size={size} color={color} onClick={onClick} className={className}>
                <Icon fontSize={fontSize} />
            </IconButton>
        </MuiTooltip >
    );
}

/**
 * Renders a Material-UI action button with a tooltip for edit action.
 * @param {string} tooltip - Tooltip text for the button.
 * @param {string} size - Size of the button.
 * @param {string} fontSize - Font size of the button icon.
 * @param {string} color - Color of the button.
 * @param {function} onClick - Callback function for button click event.
 * @returns {JSX.Element} The Material-UI action button component for edit action.
 */
export function MuiEditAction({ tooltip = "Edit", size = "sm", fontSize = "small", color = "primary", onClick = () => { } }) {
    return <MuiActionButton tooltip="Edit" size="small" fontSize="small" color="primary" onClick={onClick} Icon={EditIcon} />;
}

/**
 * Renders a Material-UI action button with a tooltip for delete action.
 * @param {string} tooltip - Tooltip text for the button.
 * @param {string} size - Size of the button.
 * @param {string} fontSize - Font size of the button icon.
 * @param {string} color - Color of the button.
 * @param {function} onClick - Callback function for button click event.
 * @returns {JSX.Element} The Material-UI action button component for delete action.
 */
export function MuiDeleteAction({ tooltip = "Edit", size = "sm", fontSize = "small", color = "primary", onClick = () => { } }) {
    return <MuiActionButton tooltip="Delete" size="small" fontSize="small" color="secondary" onClick={onClick} Icon={Delete} />;
}

/**
 * Renders a Material-UI action button with a tooltip for delete action.
 * @param {string} tooltip - Tooltip text for the button.
 * @param {string} size - Size of the button.
 * @param {string} fontSize - Font size of the button icon.
 * @param {string} color - Color of the button.
 * @param {function} onClick - Callback function for button click event.
 * @returns {JSX.Element} The Material-UI action button component for delete action.
 */
export function MuiCloseAction({ tooltip = "Edit", size = "sm", fontSize = "small", color = "primary", onClick = () => { }, ...props }) {
    return <MuiActionButton tooltip="Close" size="small" fontSize="small" color="secondary" onClick={onClick} Icon={Close} {...props} />;
}

/**
 * Renders a Material-UI action button with a tooltip and loading state.
 * @param {string} tooltip - Tooltip text for the button.
 * @param {string} size - Size of the button.
 * @param {string} fontSize - Font size of the button icon.
 * @param {string} color - Color of the button.
 * @param {function} onClick - Callback function for button click event.
 * @param {JSX.Element} Icon - Icon component to be rendered inside the button.
 * @returns {JSX.Element} The Material-UI action button component with loading state.
 */
export function MuiLoadingActionButton({ tooltip = "", size = "medium", fontSize = "regular", color = "primary", onClick = async () => { }, Icon }) {
    const [isLoading, setIsLoading] = useState(false);
    const onSubmit = useCallback(async () => {
        setIsLoading(true);
        await onClick();
        setIsLoading(false);
    }, [onClick]);
    return (
        <MuiTooltip title={tooltip}>
            <IconButton size={size} color={color} disabled={isLoading} onClick={onSubmit}>
                <Icon fontSize={fontSize} />
            </IconButton>
        </MuiTooltip >
    );
}