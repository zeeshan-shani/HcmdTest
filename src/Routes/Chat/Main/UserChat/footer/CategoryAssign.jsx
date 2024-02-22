import { useQuery } from '@tanstack/react-query';
import { Select, Space } from 'antd'
import { forwardRef, useCallback, useMemo } from 'react'
import taskCategoryService from 'services/APIs/services/taskCategoryService';
import { CONST } from 'utils/constants';

const CategoryAssign = forwardRef(function CategoryAssign({ messageText, setMessageText }, ref) {

    const { categories = [] } = messageText;

    const { data: taskCategories = [] } = useQuery({
        queryKey: ["/taskCategory/list"],
        queryFn: async () => {
            const data = await taskCategoryService.list({});
            if (data?.status === 1) return data.data
            return [];
        },
        keepPreviousData: false,
        staleTime: CONST.QUERY_STALE_TIME.L2,
    });

    const options = useMemo(() => {
        return taskCategories.map(i => ({ ...i, label: i.name, value: i.name, name: i.name })) || []
    }, [taskCategories]);

    const onSelect = useCallback((id, data) => {
        setMessageText(prev => ({ ...prev, categories: [...prev.categories, data] }))
    }, [setMessageText]);

    const onDeselect = useCallback((id, data) => {
        setMessageText(prev => ({ ...prev, categories: prev.categories.filter(item => item.id !== data.id) }))
    }, [setMessageText]);

    return (
        <Space direction="vertical" style={{ width: "100%" }}>
            <Select
                ref={ref}
                mode="multiple"
                size={"middle"}
                value={categories.map(i => i.name) || []}
                virtual={true}
                onSelect={onSelect}
                onDeselect={onDeselect}
                style={{ width: "100%" }}
                placement="topLeft"
                placeholder="Select Category"
                options={options}
            >
            </Select>
        </Space>
    )
})
export default CategoryAssign