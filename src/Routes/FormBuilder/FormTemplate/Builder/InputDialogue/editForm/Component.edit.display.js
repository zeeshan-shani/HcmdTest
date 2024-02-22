/* eslint-disable max-len */
const display = [
  {
    weight: 100,
    type: 'textfield',
    input: true,
    key: 'placeholder',
    label: 'Placeholder',
    placeholder: 'Placeholder',
    tooltip: 'The placeholder text that will appear when this field is empty.'
  },
  {
    weight: 200,
    type: 'textarea',
    input: true,
    key: 'description',
    label: 'Description',
    placeholder: 'Description for this field.',
    tooltip: 'The description is text that will appear below the input field.',
  },
  {
    weight: 300,
    type: 'checkbox',
    label: 'Disabled',
    tooltip: 'Disable the form input.',
    key: 'disabled',
    input: true
  },
]
export default display;
/* eslint-enable max-len */
