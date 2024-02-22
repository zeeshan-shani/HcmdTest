import React from "react";
import DateInput from "../../../../_common/FormGenerator/Components/DateInput";
import Input from "../../../../_common/FormGenerator/Components/Input";
import { FIELD_TYPES_NAME } from "../../../../_common/FormGenerator/Utils/constants";

const DefaultValuefield = ({ type, formContext }) => {
	const { getValues } = formContext;

	switch (type) {
		case FIELD_TYPES_NAME.text:
		case FIELD_TYPES_NAME.textarea:
		case FIELD_TYPES_NAME.radio:
		case FIELD_TYPES_NAME.checkbox:
		case FIELD_TYPES_NAME.select:
			return (
				<Input
					label="Default Value"
					name="value"
					value=""
					valueKey="value"
					type="text"
					isEditable={true}
					validationType="string"
					validations={[]}
					isRequired={false}
				/>
			);

		case FIELD_TYPES_NAME.email:
			return (
				<Input
					label="Default Value"
					name="value"
					value=""
					valueKey="value"
					type="email"
					isEditable={true}
					validationType="string"
					validations={[]}
					isRequired={false}
				/>
			);

		case FIELD_TYPES_NAME.password:
			return (
				<Input
					label="Default Value"
					name="value"
					value=""
					valueKey="value"
					type="password"
					isEditable={true}
					validationType="string"
					validations={[]}
					isRequired={false}
				/>
			);

		case FIELD_TYPES_NAME.number:
			return (
				<Input
					label="Default Value"
					name="value"
					value=""
					valueKey="value"
					type="number"
					isEditable={true}
					validationType="number"
					validations={[]}
					isRequired={false}
				/>
			);

		case FIELD_TYPES_NAME.date:
			getValues("isDateRange");
			return (
				<DateInput
					label="Default Value"
					classes={{ wrapper: "d-none" }}
					name="value"
					isEditable={true}
					isRequired={false}
					pluginConfiguration={{
						isDateRange: getValues("isDateRange").length !== 0,
					}}
				/>
			);

		default:
			return (
				<Input
					label="Default Value"
					name="value"
					value=""
					valueKey="value"
					type="text"
					isEditable={true}
					validationType="string"
					validations={[]}
					isRequired={false}
				/>
			);
	}
};

export default DefaultValuefield;
