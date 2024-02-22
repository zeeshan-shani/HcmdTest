/**
 * This file contains code for S3 connection.
 * It includes functions to upload an image to S3 using a presigned URL and get the media URL.
 * The code uses axios for making HTTP requests and messageService for getting the presigned URL.
 */

import axios from "axios";
import messageService from "services/APIs/services/messageService";

/**
 * Uploads an image to S3 using a presigned URL.
 * @param {File} file - The image file to be uploaded.
 * @returns {String} - The media URL of the uploaded image.
 */
export const onUploadImage = async (file) => {
	if (!file) return null;
	const res = await getPresignedUrl({ fileName: file.name, fileType: file.type });
	return res.data.url;
};

/**
 * Retrieves the presigned URL for uploading a file to S3.
 * @param {Object} payload - The payload containing the file information.
 * @returns {Object} - The presigned URL data.
 */
export const getPresignedUrl = async (payload) => {
	try {
		const data = await messageService.getPresignedUrl({ payload });
		return data;
	} catch (error) {
		console.error(error);
	}
};

/**
 * Uploads a file to S3 using the presigned URL and returns the media URL.
 * @param {String} presignedUrl - The presigned URL for uploading the file.
 * @param {File} FileObject - The file object to be uploaded.
 * @param {Function} onUploadProgress - Callback function for upload progress.
 * @returns {String} - The media URL of the uploaded file.
 */
export const uploadToS3 = async (presignedUrl, FileObject, onUploadProgress = () => { }) => {
	try {
		if (!presignedUrl) return;
		const config = { headers: { "Content-Type": FileObject.type }, onUploadProgress };
		const body = FileObject;
		const res = await axios.put(presignedUrl, body, config);
		if (res.status === 200) return presignedUrl.split("?").shift();
	} catch (error) {
		console.error(error);
	}
};