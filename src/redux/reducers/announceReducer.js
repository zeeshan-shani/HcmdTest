//anncoument list view........
import { CHAT_CONST } from "redux/constants/chatConstants";

const initialState = {
  announcements: [],
  loading: false,
  error: null,
};

const announceReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHAT_CONST.LOAD_ANNOUNCEMENT_LIST_SUCCESS:
      return {
        ...state,
        announcements: action.payload,
        loading: false,
        error: null,
      };
    case CHAT_CONST.LOAD_ANNOUNCEMENT_LIST_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    // Add more cases for other announcement-related actions if needed
    case CHAT_CONST.ADD_ANNOUNCEMENT:
      return {
        ...state,
        announcements: [action.payload, ...state.announcements],
      };
    default:
      return state;
  }
};

export default announceReducer;
