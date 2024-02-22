import { toast } from "react-hot-toast";

const UNKNOW = "something went wrong.";

// Show Error toaster
export const showError = (text = UNKNOW, id = "error", props = {}) => toast.error(text, { ...props, id });

// Show Success toaster
export const showSuccess = (text = UNKNOW, id = "success", props = {}) => toast.success(text, { ...props, id });