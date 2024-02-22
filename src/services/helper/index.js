/**
 * This file contains various functions related to chat functionality.
 * It includes functions to get designation by key, abbreviate designation, get private chat user,
 * get chat details, and check if a string is numeric.
 */
import { safeExecute } from "redux/common";
import { getState } from "redux/store";
import chatService from "services/APIs/services/chatService";
import { CONST } from "utils/constants";
import { isArrayElementEqual } from "./default";

/**
 * Retrieves the designation based on the provided key and type.
 * @param {string} key - The key to search for.
 * @param {string} type - The type of designation to retrieve.
 * @returns {object|null} - The designation object or null if not found.
 */
export const getDesignationByKey = (key, type) =>
    safeExecute(function () {
        const designate = getState().chat.userDesignations?.find(i => i?.key === key) || null;
        if (!designate) return null;
        return (type === "selectable") ? { id: designate.id, label: designate.name, value: designate.id } : designate;
    });

/**
 * Abbreviates the given designation input.
 * @param {string} input - The designation input to abbreviate.
 * @returns {string} - The abbreviated designation.
 */
export const abbreviateDesg = (input) => {
    let abbreviation = '';
    if (input === CONST.DESIGNATION_KEY.PROVIDER) abbreviation = "MD";
    if (input === CONST.DESIGNATION_KEY.NURSE_PRACTITIONER) abbreviation = "NP";
    return abbreviation;
}

/**
 * Retrieves the private chat user from the chat object.
 * @param {object} chat - The chat object.
 * @returns {object|null} - The private chat user or null if not found.
 */
export const getPrivateChatUser = (chat) => {
    const user = getState().user.user || null;
    return chat.chatusers.find(item => item.userId !== user.id)?.user ||
        (isArrayElementEqual(chat.users) ? chat.chatusers[0].user : {});
    // name: "Unknown user", profilePicture: ""
}

/**
 * Retrieves the chat details for the given chat ID.
 * @param {string} chatId - The ID of the chat.
 * @returns {object|null} - The chat details or null if not found or user does not have access.
 */
export const getChatDetails = async (chatId) => {
    const user = getState().user.user || null;
    const chat = getState().chat.chatList.find(i => i.id === chatId);
    if (chat) return chat;
    else {
        const data = await chatService.getChatData({ payload: { id: chatId } });
        if (data?.status === 1 && (data?.data?.users?.includes(user.id) || user.isGhostActive))
            return data.data;
    }
}

/**
 * Checks if a string is numeric.
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string is numeric, false otherwise.
 */
export function isStringNumeric(str) {
    const numericRegex = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?$/;
    return numericRegex.test(str);
}

export function toCamelCase(inputString) {
    return inputString.replace(/[-_\s]([a-zA-Z])/g, (_, match) => match.toUpperCase()).replace(/\s+/g, '');
}