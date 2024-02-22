/**
 * Configuration settings for different server environments.
 * The selected configuration is exported as 'base'.
 * Firebase configuration is also exported.
 */

import { CONST } from "utils/constants";

// Change ENV file version
// const version = CONST.RUN_MODE.PRODUCTION;  // for HCMD Live Server
// const version = CONST.RUN_MODE.STAGING;	// for HCMD Stage Server
// const version = CONST.RUN_MODE.DEV_PRODUCTION;	// for Dev Server (PROD DB)
const version = CONST.RUN_MODE.DEVELOPMENT;	// for HCMD Local Server (LOCAL DB)

export const firebaseConfig = {
	apiKey: "AIzaSyCsx7ANfKsR12vSAOnZ4p0KY0_KciPTR48",
	authDomain: "hcmd-fcm.firebaseapp.com",
	projectId: "hcmd-fcm",
	storageBucket: "hcmd-fcm.appspot.com",
	messagingSenderId: "251446599016",
	appId: "1:251446599016:web:95c7f69ada1f7d8a18cadd",
	measurementId: "G-DFB3BJN6T3"
};

/**
 * Returns the server configuration based on the specified version.
 * @param {string} version - The version of the server configuration to retrieve.
 * @returns {object} - The server configuration object.
 */
const getServerConfiguration = (version) => {
	const production = {
		version: CONST.RUN_MODE.PRODUCTION,
		FURL: "https://hcmdcommunication.com",
		URL: "https://api.hcmdcommunication.com", // API endpoint
		CLOUD_IMAGE: "https://dbvegu4yzhf6f.cloudfront.net",
		RUNNING: "LIVE"
	}

	const staging = {
		version: CONST.RUN_MODE.STAGING,
		FURL: "https://hcmdcommunication.com",
		URL: "https://api.hcmdcommunication.com", // API endpoint
		CLOUD_IMAGE: "https://dbvegu4yzhf6f.cloudfront.net",
		RUNNING: "LIVE"
	}

	const development = {
		version: CONST.RUN_MODE.DEVELOPMENT,
		FURL: "http://192.168.100.133:3000",
		URL: "http://35.88.156.111:443", // API endpoint
		CLOUD_IMAGE: "https://dbvegu4yzhf6f.cloudfront.net",
		RUNNING: "LOCAL"
	}

	const dev_production = { ...production, RUNNING: "LOCAL" };

	switch (version) {
		// Staging Endpoints
		case CONST.RUN_MODE.STAGING: return staging;
		// Local Endpoints
		case CONST.RUN_MODE.DEV_PRODUCTION: return dev_production;
		// Local Endpoints
		case CONST.RUN_MODE.DEVELOPMENT: return development;
		// Live Endpoints
		case CONST.RUN_MODE.PRODUCTION:
		default:
			return production;
	}
}

export const base = getServerConfiguration(version);
