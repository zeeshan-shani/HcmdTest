import React, { useCallback, useMemo, useState, useEffect } from "react";
import useDebounce from "services/hooks/useDebounce";
import { generatePayload, toastPromise, updateState } from "redux/common";
import { DataGridPro } from "@mui/x-data-grid-pro/DataGridPro/DataGridPro";
import { TakeConfirmation } from "Components/components";
import { dispatch } from "redux/store";
import { CHAT_CONST } from "redux/constants/chatConstants";
import ModalReactstrap from "Components/Modals/Modal";
import FormGenerator from "Components/FormBuilder/Build/pages/FormGenerator";
import { Button } from "react-bootstrap";
import { useQuery } from "@tanstack/react-query";
import { CONST } from "utils/constants";
import { LinearProgress } from "@mui/material";
import {
  MuiDataGridFooter,
  MuiDeleteAction,
  MuiEditAction,
} from "Components/MuiDataGrid";
import Input from "Components/FormBuilder/components/Input";
import { getDesignationByKey } from "services/helper";
import { getHCMDProviders } from "Routes/SuperAdmin/components/Facility/CreateEditFacility";
export default function Nps() {
  const [state, setState] = useState({
    rows: [],
    pageSize: 10,
    page: 1,
    loading: false,
    rowCountState: 0,
    total: 0,
    search: "",
    currSearch: "",
    create: false,
    update: false,
  });

  // My code:
  const [editingRow, setEditingRow] = useState(null);

  const handleEditRow = (row) => {
    setEditingRow(row.id);
  };
  useEffect(() => {
    console.log("setEditingRow", editingRow);
  }, [editingRow]);
  const [nursePractitioners, setNursePractitioners] = useState([]);
  async function fetchNursePractitioners() {
    try {
      const NursePracDesignation = await getDesignationByKey(
        CONST.DESIGNATION_KEY.NURSE_PRACTITIONER
      );
      const nursesData = await getHCMDProviders({
        designationId: NursePracDesignation?.id,
        populate: ["providerInfoAssignfacility"],
      });
      return nursesData;
    } catch (error) {
      console.error("Error fetching nurse practitioners:", error);
      return []; // Return an empty array in case of an error
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const nursesData = await fetchNursePractitioners();
        setNursePractitioners(nursesData.data);
        console.log("useEffext", nursesData);
      } catch (error) {
        console.error("Error fetching nurse practitioners:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    console.log("nursePractitioners", nursePractitioners);
  }, [nursePractitioners]);
  const column = useMemo(
    () => [
      { field: "name", headerName: "NP's", minWidth: 200, flex: 1 },
      { field: "email", headerName: "Email", minWidth: 200, flex: 1 },
      { field: "phone", headerName: "Mon", minWidth: 150, flex: 1 },
      { field: "profileStatus", headerName: "Tues", minWidth: 150, flex: 1 },
      { field: "role", headerName: "Wed", minWidth: 150, flex: 1 },
      { field: "speciality", headerName: "Thurs", minWidth: 150, flex: 1 },
      { field: "taskAlertTimer", headerName: "Fri", minWidth: 150, flex: 1 },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        flex: 1,
        getActions: (params) => [
          <MuiEditAction
            tooltip="Edit Group"
            onClick={() => handleEditRow(params.row)}
          />,
          <MuiDeleteAction tooltip="Delete Group" />,
        ],
      },
      // eslint-disable-next-line no-use-before-define
    ],
    []
  );

  // ?MyCode

  try {
    return (
      <>
        <div className="form-inline d-flex justify-content-between">
          <div className="input-group admin-search m-0">
            <Input
              name="search_desg"
              value={state.search}
              type="text"
              placeholder="Search Designation..."
              handleChange={(e) =>
                updateState(setState, { search: e.target.value.trim() })
              }
            />
          </div>
          <Button
            variant="primary"
            onClick={() => updateState(setState, { create: true })}
          >
            Add Designation
          </Button>
        </div>
        <div
          className={`mt-2 cstm-mui-datagrid ${
            !nursePractitioners?.length ? "loading" : "not_loading"
          }`}
          style={{ maxHeight: "88vh", width: "100%", flexGlow: 1 }}
        >
          <DataGridPro
            columns={column}
            rows={nursePractitioners ? nursePractitioners : []}
            autoHeight
            components={{
              LoadingOverlay: LinearProgress,
              Footer: () => (
                <MuiDataGridFooter
                  lastUpdated={nursePractitioners?.lastUpdated}
                  pagination={{
                    page: state?.page,
                    total: nursePractitioners?.count || 0,
                    pageSize: state?.pageSize,
                  }}
                  onPageChange={(e, page) => {
                    updateState(setState, { page: page });
                  }}
                />
              ),
            }}
            density="compact"
            disableColumnFilter
            editable
            // Enable editing for the row that matches the editingRow
            editRowsModel={editingRow ? [editingRow] : []}
            onEditCellChange={(editCellProps) => {
              const { id, field, value } = editCellProps;
              const updatedRows = nursePractitioners.map((row) => {
                if (row.id === id) {
                  return { ...row, [field]: value };
                }
                return row;
              });
              setNursePractitioners(updatedRows);
            }}
          />
        </div>
      </>
    );
  } catch (error) {
    console.error(error);
  }
}
