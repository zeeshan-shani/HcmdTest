import Input from "./Components/Input";
import TextArea from "./Components/TextArea";
import Radio from "./Components/Radio";
import Checkbox from "./Components/Checkbox";
import Select from "./Components/Select";
import DateInput from "./Components/DateInput";
import PhoneInput from "./Components/PhoneInput";
import FileUpload from "./Components/FileUpload";
import CkEditor from "./Components/CkEditor";

export const FIELD_TYPES = {
	text: Input,
	email: Input,
	password: Input,
	number: Input,
	textarea: TextArea,
	radio: Radio,
	checkbox: Checkbox,
	select: Select,
	file: FileUpload,
	date: DateInput,
	phone: PhoneInput,
	editor: CkEditor,
};

export const DEFAULT_VALUES = {
	text: "",
	email: "",
	number: 0,
	password: "",
	textarea: "",
	radio: "",
	checkbox: [],
	select: [],
	file: [],
	phone: "",
	date: "",
};
