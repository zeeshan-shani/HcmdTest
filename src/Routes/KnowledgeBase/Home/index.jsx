import React, { useEffect, useState } from 'react'
import ErrorBoundary from 'Components/ErrorBoundry';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LazyComponent } from 'redux/common';
import KBSearch from '../KBSearch';
import { dispatch } from 'redux/store';
import { ISSUE_CONST } from 'redux/constants/issuesConstants';
import { ReactComponent as Loader } from "assets/media/messageLoader.svg";
import { Warning } from '@mui/icons-material';
import knowledgebaseService from 'services/APIs/services/knowledgebaseService';
import Input from 'Components/FormBuilder/components/Input';
import { Button } from 'antd';
import useDebounce from 'services/hooks/useDebounce';

const defaultState = {
  search: {
    category: "",
    subject: "",
    description: ""
  },
  newRequest: false,
  subCategory: null,
  isLoading: false,
  isSearchData: false
}

export default function KnowledgeBaseHome() {
  const navigate = useNavigate();
  const [state, setState] = useState(defaultState);
  const { taskLabels: categories, loadingTasklabel } = useSelector((state) => state.task);
  const { search, isLoading } = state;
  const newSearch = useDebounce(search, 500);

  useEffect(() => {
    (async () => {
      if (!newSearch.subject && !newSearch.description)
        return setState(prev => ({ ...prev, isSearchData: false }));
      setState(prev => ({ ...prev, isLoading: true }));
      let payload = {}
      if (newSearch.subject) payload.subject = newSearch.subject
      if (newSearch.description) payload.description = newSearch.description
      if (newSearch.category)
        payload.categoryIds = categories
          .filter(i => i.name.toLowerCase().includes(newSearch.category.toLowerCase())).map(i => i.id)
      const data = await knowledgebaseService.searchList({ payload });
      if (data?.status) dispatch({ type: ISSUE_CONST.RES_LIST_ISSUES_CATEGORY, payload: data.data });
      setState(prev => ({ ...prev, isLoading: false, isSearchData: true }));
    })();
  }, [newSearch, categories]);

  return (
    <ErrorBoundary>
      <div className={`issues-search-category p-2 mx-1`}>
        <div className="d-flex search-input category align-items-center">
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
            <Button className="btn btn-primary h-100 text-white" loading={isLoading}
              onClick={() => setState((prev) => ({ ...prev, search: { ...prev.search, } }))}>
              Search
            </Button>
          </div>
          {/* {newSearch &&
              <MuiActionButton Icon={Cancel} onClick={() => setState(prev => ({ ...prev, search: '' }))} />} */}
          {/* <div className={`input-group`}>
            <input
              type="text"
              className="form-control search border-right-0 pr-0 light-text-70"
              placeholder="Search Category, Request..."
              value={state.search}
              onChange={(e) => setState(prev => ({ ...prev, search: e.target.value }))} />
            <div className="input-group-append">
              <Button className="btn btn-primary h-100" loading={isLoading}>
                <Search />
              </Button>
            </div>
          </div> */}
        </div>
      </div>
      <div className="row d-flex flex-wrap issues-category-cards m-1">
        {(!state.isSearchData) ?
          (loadingTasklabel ? (
            <div>
              <Loader height={"80px"} />
              <p>Fetching Data...</p>
            </div>
          ) :
            !!categories.length ?
              (categories
                .filter(i => i.name && i.name.toLowerCase().includes(newSearch.category.toLowerCase()))
                .map((card, index) => {
                  return (
                    <div key={index} className="col-xxl-2 col-xl-3 col-lg-3 col-md-4 col-sm-6 col-xs-12 my-1">
                      <div
                        className="card cursor-pointer position-relative"
                        title={`Click to open ${card.name} category`}
                        onClick={() => navigate(`/knowledge/category/${card.id}`)}
                      >
                        {!!card?.issuesAssignedUsers?.length &&
                          <div className="category_noti_count position-absolute">
                            {card.issuesAssignedUsers.length}
                          </div>}
                        <div className="card-body text-center">
                          <h5 className="card-title my-1 text-truncate">{card.name}</h5>
                        </div>
                      </div>
                    </div>);
                })) :
              (<div className='text-muted text-center my-3'>
                <Warning />
                <p>No Categories available.</p>
              </div>)
          ) :
          <LazyComponent>
            {state.isSearchData && <KBSearch />}
          </LazyComponent>
        }
      </div>
    </ErrorBoundary>)
}
