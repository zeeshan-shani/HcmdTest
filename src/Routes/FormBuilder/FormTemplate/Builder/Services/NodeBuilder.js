import ButtonClass from './ButtonClass';
import LabelClass from './LabelClass';
import NumberClass from './NumberClass';
import PasswordClass from './PasswordClass';
import RadioClass from './RadioClass';
import SelectClass from './SelectClass';
import TextAreaClass from './TextAreaClass';
import TextFieldClass from './TextFieldClass';
import SignatureClass from './SignatureClass';
import DateTimeClass from './DateTimeClass';
import CheckBoxClass from './CheckBoxClass';
import ImageClass from './ImageClass';

const getId = () => `dndnode_${Date.now()}`;

const buildInputNode = ({ type, position, id, style = {}, nodeData = {}, output = {} }) => {
    let newNode = {
        id: id || getId(),
        type,
        position,
        output,
        style,
        data: { label: `${type} node` },
    };
    switch (type) {
        case "LabelNode":
            const LabelNode = new LabelClass();
            newNode.data = {
                ...newNode.data,
                ...LabelNode.defaultValue,
                ...nodeData,
                onChange: LabelNode.onChange
            }
            break;
        case "TextFieldNode":
            const TextField = new TextFieldClass();
            newNode.data = {
                ...newNode.data,
                ...TextField.defaultValue,
                ...nodeData,
                onChange: TextField.onChange
            }
            break;
        case "TextAreaNode":
            const TextArea = new TextAreaClass();
            newNode.data = {
                ...newNode.data,
                ...TextArea.defaultValue,
                ...nodeData,
                onChange: TextArea.onChange
            }
            break;
        case "NumberNode":
            const InputNumber = new NumberClass();
            newNode.data = {
                ...newNode.data,
                ...InputNumber.defaultValue,
                ...nodeData,
                onChange: InputNumber.onChange
            }
            break;
        case "ButtonNode":
            const inputButton = new ButtonClass();
            newNode.data = {
                ...newNode.data,
                ...inputButton.defaultValue,
                ...nodeData,
                onChange: inputButton.onChange
            }
            break;
        case "PasswordNode":
            const PasswordNode = new PasswordClass();
            newNode.data = {
                ...newNode.data,
                ...PasswordNode.defaultValue,
                ...nodeData,
                onChange: PasswordNode.onChange
            }
            break;
        case "CheckBoxNode":
            const CheckBoxNode = new CheckBoxClass();
            newNode.data = {
                ...newNode.data,
                ...CheckBoxNode.defaultValue,
                ...nodeData,
                onChange: CheckBoxNode.onChange
            }
            break;
        case "RadioNode":
            const RadioNode = new RadioClass();
            newNode.data = {
                ...newNode.data,
                ...RadioNode.defaultValue,
                ...nodeData,
                onChange: RadioNode.onChange
            }
            break;
        case "SelectNode":
            const SelectNode = new SelectClass();
            newNode.data = {
                ...newNode.data,
                ...SelectNode.defaultValue,
                ...nodeData,
                onChange: SelectNode.onChange
            }
            break;
        case "DateTimeNode":
            const DateTimeNode = new DateTimeClass();
            newNode.data = {
                ...newNode.data,
                ...DateTimeNode.defaultValue,
                ...nodeData,
                onChange: DateTimeNode.onChange
            }
            break;
        case "SignatureNode":
            const SignatureNode = new SignatureClass();
            newNode.data = {
                ...newNode.data,
                ...SignatureNode.defaultValue,
                ...nodeData,
                onChange: SignatureNode.onChange
            }
            break;
        case "ImageNode":
            const ImageNode = new ImageClass();
            newNode.data = {
                ...newNode.data,
                ...ImageNode.defaultValue,
                ...nodeData,
                onChange: ImageNode.onChange
            }
            break;
        default:
    }
    return newNode;
}

export { buildInputNode }