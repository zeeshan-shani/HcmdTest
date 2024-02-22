/**
 * This file contains various utility functions for sorting objects, manipulating local storage, converting strings to camel case, and more.
 */

// This function receives an array of objects, a field to sort by, and an optional level to sort on
export function sortObjectsByField(objects, field, level = 1) {
    const compare = (a, b) => {
        const valueA = getFieldByLevel(a, field, level);
        const valueB = getFieldByLevel(b, field, level);
        if (valueA < valueB) return 1;
        if (valueA > valueB) return -1;
        return 0;
    };
    return [...objects]?.sort(compare) || {};
}
// This function retrieves the value of a specified field on the specified object, up to the specified level
function getFieldByLevel(object, field, level) {
    // The field is split into an array of nested fields
    const fields = field.split('.');
    let value = object;
    for (let i = 0; i < level; i++) {
        const currentField = fields[i];
        value = value[currentField];
    }
    // The final value is returned
    return value;
}

// Retrieves an item from local storage
export const getLocalStore = (item) => JSON.parse(localStorage.getItem(item)) || {}

// Sets an item in local storage
export const setLocalStore = (item, value) => localStorage.setItem(item, JSON.stringify(value));

// Converts a string to camel case
export const convertToCamelCase = (str) =>
    str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');

// Sorts an array of objects by a specified field
export const sortCharByField = (arr, field) =>
    arr.sort(function (a, b) {
        const [aLabel, bLabel] = [a[field].toLowerCase(), b[field].toLowerCase()];
        if (aLabel < bLabel) return -1;
        if (aLabel > bLabel) return 1;
        return 0;
    });

// Checks if all elements in an array are equal
export const isArrayElementEqual = (arr = []) => arr.every(val => val === arr[0]);

// Downloads a file using a Blob object
export const downloadFilebyBlob = (blob, fileName = 'HCMD_ExcelSheet.xlsx') => {
    let link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

// Reorders the column order object based on the target and old indices
export const reorderColumnOrderObject = (columnOrderObject, targetIndex, oldIndex, field) => {
    const columnOrderArray = Object.entries(columnOrderObject);
    // Find the index of the field in the array
    const fieldIndex = columnOrderArray.findIndex(([key, value]) => key === field);
    // Remove the field from its old position
    const [removed] = columnOrderArray.splice(fieldIndex, 1);
    // Insert the field at its new position
    columnOrderArray.splice(targetIndex, 0, removed);
    // Update the order values in the array
    const updatedColumnOrderArray = columnOrderArray.map(([key, value], index) => ({ [key]: index }));
    // Convert the array back to an object
    const updatedColumnOrderObject = Object.assign({}, ...updatedColumnOrderArray);
    return updatedColumnOrderObject;
};

// Removes non-alphanumeric characters from a string
export const Number = (str) => str.replace(/[^\w\s]/gi, '');
// Removes the "null " prefix from a string
export const PureName = (str) => str.replace(/^null /, '');