importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

//hcmd firebase config
const firebaseConfig = {
	apiKey: "AIzaSyCsx7ANfKsR12vSAOnZ4p0KY0_KciPTR48",
	authDomain: "hcmd-fcm.firebaseapp.com",
	projectId: "hcmd-fcm",
	storageBucket: "hcmd-fcm.appspot.com",
	messagingSenderId: "251446599016",
	appId: "1:251446599016:web:95c7f69ada1f7d8a18cadd",
	measurementId: "G-DFB3BJN6T3"
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();
// const messaging = getMessaging();

// onMessage(messaging, (payload) => {
// 	console.log('Message received. ', payload);
// 	// ...
// });

messaging.onBackgroundMessage(function (payload) {
	console.log('Received background message ', payload);
	// console.log('Received visiblity ', document.visibilityState);

	const notificationTitle = payload.notification.title;
	const notificationOptions = {
		...payload.notification,
	};

	this?.registration?.showNotification(notificationTitle, notificationOptions);
});
