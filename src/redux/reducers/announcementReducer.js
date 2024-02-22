//show anncuemet.............

import { CHAT_CONST } from 'redux/constants/chatConstants';

const initialState = {
  showAnnouncement: false,
  // other chat-related state...
};

const announcementReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHAT_CONST.SET_ANNOUNCEMENT:
      return { ...state, showAnnouncement: action.payload };
    // handle other chat-related actions...
    default:
      return state;
  }
};

export default announcementReducer;
