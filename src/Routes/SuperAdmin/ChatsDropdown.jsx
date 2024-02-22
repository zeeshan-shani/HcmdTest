import { useRef, useState } from 'react';
import { Search } from '@mui/icons-material';
import { generatePayload } from 'redux/common';
import debounce from 'lodash/debounce';
import AsyncSelect from 'react-select/async';
import chatService from 'services/APIs/services/chatService';


export const ChatsDropdown = ({ groupData, setGroupData }) => {
    const selectRef = useRef();
    const [loading, setLoading] = useState(false);

    const loadSuggestions = debounce(async (query, callback) => {
        setLoading(true);
        let payload = await generatePayload({
            keys: ["name"], value: query || "",
            options: {
                sort: [["name", "asc"]],
                attributes: ["id", "name", "image", "type", "createdAt"],
                pagination: true,
                limit: 10,
                page: 1
            },
        });
        const data = await chatService.getGrouplist({ payload })
        setLoading(false);
        if (data?.status === 1)
            return callback(
                data.data.map(group => ({
                    ...group,
                    label: group.name,
                    value: group.id,
                }))
            );
        return callback([]);
    }, 1000);

    return (
        <AsyncSelect
            ref={selectRef}
            isLoading={loading}
            classNamePrefix="select"
            loadOptions={loadSuggestions}
            defaultOptions
            cacheOptions={true}
            name={"select-chat"}
            value={groupData ? [groupData] : []}
            onChange={(value) => setGroupData(value)}
            placeholder="Search Chat..."
            isClearable={false}
            isSearchable
            components={{ DropdownIndicator: () => <Search className='mx-1 text-muted' /> }}
        />
    );
}
