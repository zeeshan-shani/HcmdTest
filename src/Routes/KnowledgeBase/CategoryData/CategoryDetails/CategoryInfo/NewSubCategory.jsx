import React, { useCallback, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap';
import ModalReactstrap from 'Components/Modals/Modal';
import labelsubCategoryService from 'services/APIs/services/labelsubCategoryService';
import { toastPromise } from 'redux/common';

export default function NewSubCategory({ showModal, onCreate, onCancel, activeCard, mode = 'create', updateData }) {
    const [subcategoryName, setSubcategoryName] = useState('');
    const [error, setError] = useState();

    useEffect(() => {
        if (mode === 'update') setSubcategoryName(updateData.name);
    }, [updateData, mode]);

    const onSubmitHandler = useCallback(async (e) => {
        e.preventDefault();
        if (!subcategoryName)
            return setError((prev) => ({ ...prev, subcategory: 'Category is required!' }));
        if (subcategoryName.length < 3)
            return setError((prev) => ({ ...prev, subcategory: 'Required minimun 3 Character!' }));
        setError((prev) => ({ ...prev, subcategory: null }));
        await toastPromise({
            func: async (myResolve, myReject) => {
                try {
                    const payload = {
                        labelId: mode === 'update' ? updateData.id : activeCard.id,
                        name: subcategoryName,
                    }
                    const data = mode === 'update' ?
                        await labelsubCategoryService.update({ payload }) :
                        await labelsubCategoryService.create({ payload });
                    if (data?.status === 1) {
                        onCreate();
                        onCancel();
                    };
                    myResolve(data);
                } catch (error) {
                    myReject("Error");
                }
            },
            loading: `${mode === 'create' ? 'Creating' : 'Updating'} sub category`,
            success: <b>{`Successfully ${mode === 'create' ? 'create' : 'update'} sub category`}</b>,
            error: <b>{`Could not ${mode === 'create' ? 'create' : 'update'} sub category.`}</b>,
            options: { id: "create-category" }
        })
    }, [activeCard.id, mode, onCancel, onCreate, subcategoryName, updateData.id]);

    if (!showModal) return;
    return (<>
        <ModalReactstrap
            show={Boolean(showModal)}
            header={mode === 'create' ? 'Create Category' : 'Update Category'}
            body={
                <form onSubmit={onSubmitHandler}>
                    <div className="form-group">
                        <label htmlFor="subCategory">Sub Category</label>
                        <input type="text" className="form-control form-control-md" id="subCategory"
                            minLength={3}
                            placeholder="Type Sub Category name"
                            required
                            name="subcategory"
                            value={subcategoryName} onChange={(e) => setSubcategoryName(e.target.value)} />
                        {error?.subcategory && <span className='fs-12 text-danger line-height-1 mt-1'>{error.subcategory}</span>}
                    </div>
                </form>
            }
            footer={<>
                <Button color="secondary" onClick={onCancel}>Cancel</Button>
                <Button color="primary" onClick={onSubmitHandler} type="submit">
                    {mode === 'create' ? 'Create' : 'Update'}
                </Button>
            </>}
        />
    </>);
}