import React from "react";
import Dropzone from "react-dropzone";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { CloseButton, Form } from "react-bootstrap";
import { Upload } from "react-bootstrap-icons";
import { FRAMEWORK_TYPES } from "../../Utils/constants";
import "./index.css";

const FileUpload = ({
  name,
  label = "",
  isEditable = true,
  isRequired = false,
  onChange: changeHandler = () => { },
  pluginConfiguration: config = {
    isMulti: false,
    maxFiles: 5,
    maxFileSize: 0,
    acceptedFileTypes: [],
    imagePreview: false,
  },
  classes: customClasses = { wrapper: "", label: "", field: "", error: "" },
  framework = FRAMEWORK_TYPES.react_bs,
}) => {
  const { control, setValue, setError, clearErrors } = useFormContext();
  const values = useWatch({ name: name });

  const validateValues = (inp) => {
    clearErrors(name);
    if (inp.length > config.maxFiles) {
      setError(name, {
        type: "custom",
        message: `Maximum ${config.maxFiles} files can be uploaded.`,
      });
      return;
    }
    inp.forEach((file, i) => {
      const filename = `${name}.${i}`;
      if (
        !!config.acceptedFileTypes?.length &&
        !config.acceptedFileTypes.some((fi) => file.type.includes(fi))
      ) {
        setError(`${filename}`, {
          type: "custom",
          message: `${file.name} is unsupported document type.`,
        });
        return;
      }
      if (!!config.maxFileSize && file.size >= config.maxFileSize) {
        setError(`${filename}`, {
          type: "custom",
          message: `${file.name} is too large.`,
        });
        return;
      }
      clearErrors(`${filename}`);
    });
  };

  const handleFileInputChange = async (files) => {
    // const convertedFiles = await Promise.all(
    //   files.map(async (file) => {
    //     // const base64 = await getBase64(file).then((result) => {
    //     //   return result;
    //     // });
    //     return {
    //       name: file.name,
    //       type: file.type,
    //       size: file.size,
    //       // base64,
    //       preview: URL.createObjectURL(file),
    //     };
    //   })
    // );
    if (!config.isMulti) {
      changeHandler([...files]);
      setValue(name, [...files]);
      validateValues([...files]);
      return;
    }
    const op = files.filter((file) => {
      return !values.some(
        (v) =>
          v.name + "_" + v.type + "_" + v.size ===
          file.name + "_" + file.type + "_" + file.size
      );
    });
    changeHandler([...values, ...op]);
    setValue(name, [...values, ...op]);
    validateValues([...values, ...op]);
  };

  // const getBase64 = (file) => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => resolve(reader.result);
  //     reader.onerror = (error) => reject(error);
  //   });
  // };

  const nameEllipsis = (string) =>
    String(string).length > 20
      ? String(string).substring(0, 10) +
      "..." +
      String(string).substring(string.length - 10)
      : string;

  const documentDeleteHandler = (index) => {
    const newVal = values.filter((_, i) => i !== index);
    setValue(name, newVal, { shouldValidate: true });
    validateValues(newVal);
  };

  return (
    <Form.Group className={`mb-3 ${customClasses.wrapper}`} controlId={name}>
      {label !== "" && (
        <Form.Label className={customClasses.label}>
          {label}
          {isRequired && <span className="small text-danger">*</span>}
        </Form.Label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState: { error } }) => (
          <>
            {
              <Dropzone
                name={name}
                id={name}
                className={customClasses.field}
                multiple={config.isMulti}
                value={field.value || []}
                // maxFiles={maxFiles}
                // accept={acceptedFileTypes}
                onDrop={(acceptedFiles) => {
                  if (isEditable === false) {
                    return;
                  }
                  handleFileInputChange(acceptedFiles);
                }}
                disabled={isEditable === false}
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps({
                      className: "dropzone",
                    })}
                  >
                    <div>
                      <input {...getInputProps()} />
                      <div
                        className="upload-wrapper border-2 border-secondary p-3 rounded-3"
                        style={{ borderStyle: "dashed" }}
                      >
                        <div className="h-100 w-100">
                          {values && !!values.length ? (
                            <div className="files-container">
                              {values.map((file, i) => {
                                return config.imagePreview &&
                                  file.type.includes("image") ? (
                                  <div
                                    className="thumbs-container"
                                    key={file.name + "_" + file.type + "_" + file.size}
                                  >
                                    <div className="thumbs-wrapper">
                                      <div className="thumbs-inner">
                                        <img
                                          alt={nameEllipsis(file.name)}
                                          className="thumb-img"
                                          src={URL.createObjectURL(file)}
                                        />
                                      </div>
                                    </div>
                                    <CloseButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        documentDeleteHandler(i);
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    key={file.name + "_" + file.type + "_" + file.size}
                                    className="thumbs-container"
                                  >
                                    {nameEllipsis(file.name)}
                                    <CloseButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        documentDeleteHandler(i);
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="d-flex flex-column align-items-center justify-content-center">
                              <span className="me-3 text-secondary">
                                <Upload />
                              </span>
                              <span>
                                Drag and Drop file here or Click here to browse
                                files.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Dropzone>
            }
            {!!error && (
              <Form.Text className={`text-danger ${customClasses.error}`}>
                {Array.isArray(error) ? (
                  error.map((err, i) => <div key={i}>{err.message}</div>)
                ) : (
                  <div>{error.message}</div>
                )}
              </Form.Text>
            )}
          </>
        )}
      />
    </Form.Group>
  );
};

export default FileUpload;
