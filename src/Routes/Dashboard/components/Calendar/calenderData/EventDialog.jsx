import React, { useMemo } from "react";
import moment from "moment-timezone";
import FormGenerator from "Components/FormBuilder/Build/pages/FormGenerator";
import { Button } from "react-bootstrap";
import ModalReactstrap from "Components/Modals/Modal";

const EventDialog = props => {
  const {
    className,
    modal,
    toggleModal,
    event,
    action,
    eventDeleteHandler,
    // setEvents, updateEvent
  } = props;

  let formData = useMemo(() => calenderForm.map((item) => {
    if (event && event.hasOwnProperty(item.name) && event['id']) {
      if (item.name === 'start' || item.name === 'end') item.value = moment(event[item.name]).toDate();
      else if (action === 'edit') item.value = event[item.name];
      else item.value = "";
    }
    else if (item.name === 'start' || item.name === 'end') item.value = moment(event?.start ? new Date(event[item.name]) : new Date()).toDate();
    else item.value = "";
    return item;
  }), [action, event]);

  const onSubmit = async (body) => {
    // if (action === "add") {
    //   const { data } = await .post('/providerslot/create', { ...body });
    //   if (data?.status === 1) {
    //     setEvents(pre => [...pre, { ...data.data }]);
    //   }
    //   if (data?.status === 2) {
    //     return toast.error(data.message);
    //   }
    // } else if (action === "edit") {
    //   updateEvent({ ...body, id: event.id });
    // }
    // toggleModal();
  }

  return (
    <ModalReactstrap
      header='Schedule Availability'
      show={modal}
      toggle={toggleModal}
      Modalprops={{ className }}
      centered
      body={
        <FormGenerator
          className="m-1"
          dataFields={formData}
          onSubmit={(data) => onSubmit(data)}
          FormButtons={() => <div className="col-12 gap-5 px-0">
            {action === 'edit' ?
              <>
                <Button className="bg-danger border-0" onClick={() => eventDeleteHandler(event)}>
                  Delete
                </Button>
                <Button type="submit">Update</Button>
              </> : <>
                <Button variant="secondary" onClick={toggleModal}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </>
            }
          </div>}
        />
      }
    />
  );
};
export default EventDialog;


const calenderForm = [
  {
    "name": "title", "label": "Title", "valueKey": "title", "value": "", "type": "text", "validationType": "string", "validations": [{ "type": "required", "params": ["Title is required!"] }], "isEditable": true,
    "classes": { wrapper: "mb-2", label: "", field: "", error: "" },
  },
  {
    "name": "start", "label": "Start", "valueKey": "start", "value": moment().toDate(), "type": "date", "validationType": "string", "validations": [], "isEditable": true, "pluginConfiguration": { "isDateRange": false, "timeRequired": true },
    "classes": { wrapper: "mb-2", label: "", field: "", error: "" },
  },
  {
    "name": "end", "label": "End", "valueKey": "end", "value": moment().add(1, 'hour').toDate(), "type": "date", "validationType": "string", "validations": [], "isEditable": true, "pluginConfiguration": { "isDateRange": false, "timeRequired": true },
    "classes": { wrapper: "mb-2", label: "", field: "", error: "" },
  },
  // {
  //   "name": "description", "label": "Description", "valueKey": "description", "value": "", "type": "textarea", "validationType": "string", "validations": [], "isEditable": true, "pluginConfiguration": { "rows": 2 },
  //   "classes": { wrapper: "mb-2", label: "", field: "", error: "" },
  // },
]