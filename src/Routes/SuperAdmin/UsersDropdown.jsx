import { useRef, useState } from 'react';
import { debounce } from 'lodash';
import { Search } from '@mui/icons-material';
import { generatePayload } from 'redux/common';
import AsyncSelect from 'react-select/async';
import userService from 'services/APIs/services/userService';

export const UsersDropdown = ({
    userData,
    setUserData,
    classes = '',
    designations,
    isMulti = false,
    placeholder = "Search User..."
}) => {
    const selectRef = useRef();
    const [loading, setLoading] = useState(false);

    const loadSuggestions = debounce(async (query, callback) => {
        setLoading(true);
        let payload = await generatePayload({
            keys: ["name", "firstName", "lastName"],
            value: query || "",
            rest: { includeOwn: true, isActive: true, designationNames: designations && !!designations?.length ? designations : undefined },
            options: {
                attributes: ["id", "name"],
                sort: [["name", "ASC"]],
                pagination: true,
                limit: 10,
                page: 1
            }
        });
        const data = await userService.list({ payload });
        setLoading(false);
        if (data?.status === 1)
            return callback(
                data.data.map(chat => ({
                    ...chat,
                    label: chat.name,
                    value: chat.id,
                    id: chat.id,
                }))
            );
        return callback([]);
    }, 1000);

    return (
        <AsyncSelect
            ref={selectRef}
            isLoading={loading}
            classNamePrefix="select"
            className={`${classes} min-width-160`}
            loadOptions={loadSuggestions}
            defaultOptions
            cacheOptions={true}
            name={"select-user"}
            value={userData ? (isMulti ? userData : [userData]) : []}
            onChange={(value) => setUserData(isMulti ? value : [value])}
            placeholder={placeholder}
            isClearable={false}
            isMulti={isMulti}
            isSearchable
            menuPlacement='auto'
            components={{ DropdownIndicator: () => <Search className='mx-1 text-muted' /> }}
        />
    )
}
