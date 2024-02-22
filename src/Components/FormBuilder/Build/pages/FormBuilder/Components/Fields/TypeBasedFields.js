import React from "react";
import { Col } from "react-bootstrap";
import Checkbox from "../../../../_common/FormGenerator/Components/Checkbox";
import Input from "../../../../_common/FormGenerator/Components/Input";
import { FIELD_TYPES_NAME } from "../../../../_common/FormGenerator/Utils/constants";

const TypeBasedFields = ({ type, formContext }) => {
  const { setValue } = formContext;

  switch (type) {
    case FIELD_TYPES_NAME.select:
      return (
        <Col className="d-none">
          {/* <h6>Plugin configurations</h6> */}
          <Checkbox
            label=""
            name="selectPluginConfigs"
            value={[]}
            valueKey="selectPluginConfigs"
            type="checkbox"
            optionKey={{
              url: "",
              method: "",
            }}
            options={[
              { value: "isMulti", label: "Multi Select" },
              { value: "isClearable", label: "Clearable" },
              { value: "isRtl", label: "Right to left" },
              { value: "isSearchable", label: "Enable search" },
            ]}
            isEditable={true}
            validationType="array"
            validations={[]}
          />
        </Col>
      );

    case FIELD_TYPES_NAME.textarea:
      return (
        <Col md={6}>
          {/* <h6>Plugin configurations</h6> */}
          <Input
            label="Rows"
            name="rows"
            value={[]}
            valueKey="rows"
            type="number"
            isEditable={true}
            validationType="number"
            validations={[]}
            isRequired={true}
          />
        </Col>
      );

    case FIELD_TYPES_NAME.file:
      return (
        <>
          {/* <h6>Plugin configurations</h6> */}
          {/* <Checkbox
            label=""
            name="fileConfigs"
            value={[]}
            valueKey="fileConfigs"
            type="checkbox"
            optionKey={{
              url: "",
              method: "",
            }}
            options={[
              {
                value: "isMulti",
                label: "Allow multiple file uploads",
              },
              {
                value: "imagePreview",
                label: "Enable preview for image files",
              },
            ]}
            isEditable={true}
            validationType="array"
            validations={[]}
          />
          <Row>
            <Col>
              <Input
                label="Max number of files"
                name="maxFiles"
                value={[]}
                valueKey="maxFiles"
                type="number"
                isEditable={true}
                validationType="number"
                validations={[]}
              />
            </Col>
            <Col>
              <Input
                label="Max file size"
                name="maxFileSize"
                value={[]}
                valueKey="maxFileSize"
                type="number"
                isEditable={true}
                validationType="number"
                validations={[]}
              />
            </Col>
          </Row> */}
        </>
      );

    case FIELD_TYPES_NAME.date:
      return (
        <Col className="d-none">
          {/* <h6>Plugin configurations</h6> */}
          <Checkbox
            label=""
            name="isDateRange"
            value={[]}
            valueKey="isDateRange"
            type="checkbox"
            optionKey={{
              url: "",
              method: "",
            }}
            options={[{ value: "true", label: "Date Range" }]}
            isEditable={true}
            validationType="array"
            validations={[]}
            onChange={() => {
              setValue("value", "");
            }}
          />
        </Col>
      );

    default:
      return;
  }
};

export default TypeBasedFields;
