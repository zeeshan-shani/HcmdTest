import * as yup from "yup";

export const loginSchema = yup.object().shape({
	email: yup.string().required("Email is a required field").email("Invalid email format"),
	password: yup.string().required("Password is a required field"),
	// .min(6, "Password must be at least 6 characters"),
	rememberMe: yup.bool(),
});
