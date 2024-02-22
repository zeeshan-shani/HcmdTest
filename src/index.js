// Import React and ReactDOM
import React from "react";
import ReactDOM from "react-dom/client";

// Import App, store, and other components
import App from "App";
import store from "redux/store";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom/dist/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Import Bootstrap and CSS files
import "bootstrap/dist/js/bootstrap.min.js";
import "react-bootstrap/dist/react-bootstrap.js";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "assets/css/app.min.css";
import "styles/index.css";
import "styles/App.css";

// Create a new query client
export const queryClient = new QueryClient();
// Render the app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	// <React.StrictMode>
	<Provider store={store}>
		<Router>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</Router>
	</Provider>
	// </React.StrictMode>
);