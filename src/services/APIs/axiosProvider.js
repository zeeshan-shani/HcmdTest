/**
 * JavaScript code for axiosProvider.js file.
 * This file exports a function that creates an instance of axios with default options and a provided base URL.
 * The function takes a base URL and an optional options object as parameters.
 * It returns an axios instance with the base URL and merged options.
 */

import axios from 'axios';

// Default options for the axios instance
const defaultOptions = {
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * Creates an instance of axios with the provided base URL and options.
 * @param {string} baseUrl - The base URL for the axios instance.
 * @param {object} options - Optional options object to be merged with the default options.
 * @returns {object} - An axios instance with the base URL and merged options.
 */
function axiosProvider(baseUrl, options) {
    return axios.create({
        baseURL: baseUrl,
        ...defaultOptions,
        ...options
    });
}

export default axiosProvider;