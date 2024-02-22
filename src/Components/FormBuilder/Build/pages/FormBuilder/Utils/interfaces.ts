export interface FormField {
    name: string;
    label: string;
    valueKey: string;
    value: string;
    type: string;
    isEditable: boolean;
    validationType: string;
    validations: Validator[];
    options?: Option[];
    optionKey?: OptionKey;
    pluginConfiguration?: Configs;
    classes?: Classes;
  }

  interface Validator {
    type: string;
    params: Parameter[]
  }

  interface Parameter {
    message: string;
    value?: string|number
  }

  interface Option {
    label: string;
    value: string;
  }

  interface OptionKey{
    url: string,
    method: string,
    labelField: string,
    valueField: string,
  }

  interface Configs{
    isMulti?: boolean;
    imagePreview?: boolean;
    maxFiles?: number;
    maxFileSize?: number;
    acceptedFileTypes?: [];
    isDateRange?: boolean;
    isClearable?: boolean;
    isRtl?: boolean;
    isSearchable?: boolean;
    rows?: number;
  }

  interface Classes{
    wrapper?: string;
    label?: string;
    field?: string;
    error?: string
  }
  