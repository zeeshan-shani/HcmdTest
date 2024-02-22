export default async function swDev() {
	try {
		// updated on 3rd may 2023 from fireabase account given by client(haris)
		var NEW_PUBLIC_KEY = "BJjZ9YTmoW2LprBvQm-lYDQTHfF1DkPGCNNc1Yo5CkLlKiNtisFijaRD79NY958pOD0SiMFNexdikeZUEcmHUQc";
		function urlBase64ToUint8Array(base64String) {
			const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
			//eslint-disable-next-line
			const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
			const rawData = window.atob(base64);
			const outputArray = new Uint8Array(rawData.length);

			for (let i = 0; i < rawData.length; ++i) {
				outputArray[i] = rawData.charCodeAt(i);
			}
			return outputArray;
		}
		let swUrl = `${process.env.PUBLIC_URL}/sw.js`;
		navigator.serviceWorker.register(swUrl).then((response) => {
			return response.pushManager.getSubscription().then(function (subscription) {
				Notification.requestPermission(function (result) {
					if (result === "granted") {
						if (!subscription) {
							//the user was never subscribed
							subscribe(response);
						} else {
							//check if user was subscribed with a different key
							let json = subscription.toJSON();
							let public_key = json.keys.p256dh;
							if (public_key !== NEW_PUBLIC_KEY) {
								subscription
									.unsubscribe()
									.then((successful) => {
										// You've successfully unsubscribed
										subscribe(response);
									})
									.catch((e) => {
										// Unsubscription failed
									});
							}
						}
					}
				});
			});
		});

		function subscribe(registration) {
			registration.pushManager
				.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(NEW_PUBLIC_KEY),
				})
				.then((pushSubscription) => {
					//successfully subscribed to push
					//save it to your DB etc....
				});
		}
	} catch (error) {
		console.error(error);
	}
}