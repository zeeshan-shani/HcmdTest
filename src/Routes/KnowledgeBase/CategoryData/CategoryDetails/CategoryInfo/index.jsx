import React, { useCallback, useMemo, useState } from 'react';
import moment from 'moment-timezone';
import { Button } from 'react-bootstrap';
import { dispatch } from 'redux/store';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import { ReactComponent as Loader } from "assets/media/heroicons/LoginLoader.svg";
import { TakeConfirmation } from 'Components/components';

import CategoryCard from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/CategoryInfo/CategoryCard';
import NewSubCategory from 'Routes/KnowledgeBase/CategoryData/CategoryDetails/CategoryInfo/NewSubCategory';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import labelsubCategoryService from 'services/APIs/services/labelsubCategoryService';
import { useQuery } from '@tanstack/react-query';
import Input from 'Components/FormBuilder/components/Input';
import useDebounce from 'services/hooks/useDebounce';
import { queryClient } from 'index';

const defaultState = {
    search: {
        // chapter: "",
        subject: "",
        description: ""
    },
    isSearchData: false,
    addSubCategory: false,
    updateSubCategory: false
}
export default function CategoryInfo() {
    const navigate = useNavigate();
    const [state, setState] = useState(defaultState);
    const { activeCard } = useSelector((state) => state.issues);
    const { addSubCategory, updateSubCategory, search } = state;
    const newSearch = useDebounce(search, 500);

    const { data: subCategories = [], isFetching: loading, refetch } = useQuery({
        queryKey: ["/taskSubCategory/list", { ...newSearch }],
        queryFn: async () => {
            let payload = {};
            if (newSearch.subject) payload.subject = newSearch.subject
            if (newSearch.description) payload.description = newSearch.description
            const data = await labelsubCategoryService.list({
                payload: {
                    query: { labelId: activeCard?.id, ...payload },
                    options: {
                        order: [['indexValue', 'ASC'], ['issues', 'indexValue', 'ASC']],
                        populate: ["issues"]
                    }
                }
            });
            if (data?.status === 1) {
                dispatch({ type: ISSUE_CONST.SET_CARD_SUBCATEGORIES, payload: data.data });
                return data.data;
            }
            return [];
        },
        keepPreviousData: true,
        refetchOnWindowFocus: false,
        enabled: Boolean(activeCard?.id)
    });

    const getDetails = useCallback(async (issue) => {
        navigate('request/' + issue.id);
        // await toastPromise({
        //     func: async (myResolve, myReject) => {
        //         try {
        //             const data = await knowledgebaseService.requestData({ payload: { id: issue.id } });
        //             if (data?.status === 1) {
        //                 if (data.data.category === activeCard.id) {
        //                     navigate('request/' + issue.id);
        //                     dispatch({ type: ISSUE_CONST.RES_GET_REQUEST_DETAILS, payload: data.data, request: true });
        //                 }
        //             }
        //             myResolve(data);
        //         } catch (error) {
        //             myReject("Error");
        //         }
        //     }, loading: "Requesting for Issue", success: <b>Successfully get request</b>, error: <b>Could not get request.</b>,
        //     options: { id: "get-request" }
        // })
    }, [navigate]);

    const columns = useMemo(() => [
        {
            field: "subject", headerName: "Subject", minWidth: 180, flex: 1,
            renderCell: (params) => (<>{params.row.subject}</>),
        },
        {
            field: "createdAt", headerName: "Created", minWidth: 180,
            renderCell: (params) => {
                return (<div>{moment(params.row.createdAt).format("MM/DD/YY")}</div>)
            },
        },
        {
            field: "updatedAt", headerName: "Last Modified", minWidth: 180,
            renderCell: (params) => {
                return (<div>{moment(params.row.updatedAt).format("MM/DD/YY")}</div>)
            },
        }
    ], []);

    const onDeleteHandler = useCallback(async (item) =>
        TakeConfirmation({
            title: `Are you sure about delete "${item.name}" card?`,
            content: "The card will be deleted permenantly.",
            onDone: async () => {
            console.log("--->>>",activeCard);
                const data = await labelsubCategoryService.delete({ payload: { id: item.id } });
                queryClient.setQueryData(["/taskSubCategory/list", { ...newSearch }],
                    (prev) => prev ? prev.filter((item) => {
                        if (item.id === Number(data?.data)) return false;
                        return true;
                    }) : prev)
            }
        }), [newSearch]);

    const onUpdateHandler = useCallback(async (item) => setState(prev => ({ ...prev, updateSubCategory: item })), [])

    try {
        return (<>
            <div className="form-inline d-flex justify-content-between">
                <div className="form-inline gap-10">
                    {Object.keys(defaultState.search).map((key, index) => {
                        return (
                            <Input
                                key={index}
                                placeholder={"Search " + key}
                                className='search'
                                name={key}
                                handleChange={(e) => setState((prev) => ({ ...prev, search: { ...prev.search, [key]: e.target.value } }))}
                                value={state.search[key]}
                            />
                        )
                    })}
                    {/* <Button className="btn btn-primary h-100 text-white" loading={loading}>
                        Search
                    </Button> */}
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, addSubCategory: true }))}>
                    Add card
                </Button>
            </div>
            <div className="sub-categories">
                {loading && <div className="loader">
                    <Loader className='login_loader' />
                </div>}
                {!!subCategories.length ?
                    subCategories
                        .sort(function (a, b) { return a.indexValue - b.indexValue })
                        .map((item, index) => {
                            return (
                                <CategoryCard
                                    key={item.id}
                                    activeCardId={activeCard.id}
                                    fIndex={index}
                                    index={item.indexValue}
                                    item={item}
                                    columns={columns}
                                    subCategories={subCategories}
                                    setcategoryState={setState}
                                    onDeleteHandler={onDeleteHandler}
                                    onUpdateHandler={onUpdateHandler}
                                    getDetails={getDetails}
                                    searchData={newSearch.subject || newSearch.description}
                                    refetch={refetch}
                                    newSearch={newSearch}
                                />)
                        })
                    : <div className='d-flex justify-content-center my-2'>No Topic available</div>}
            </div>
            {activeCard && (addSubCategory || updateSubCategory) &&
                <NewSubCategory
                    showModal={true}
                    mode={(addSubCategory ? 'create' : (updateSubCategory && 'update'))}
                    activeCard={activeCard}
                    onCancel={() => setState(prev => ({ ...prev, addSubCategory: false, updateSubCategory: false }))}
                    onCreate={refetch}
                    updateData={updateSubCategory}
                />}
        </>);
    } catch (error) {
        console.error(error);
    }
}