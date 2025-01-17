import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  SIGNUP_REQUEST,
  SIGNUP_SUCCESS,
  SIGNUP_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  GET_USER_FAILURE,
  LOGOUT,
} from "./ActionTypes";

const initialState = {
  user: null,
  loading: false,
  error: null,
  jwt: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case SIGNUP_REQUEST:
    case GET_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
    case SIGNUP_SUCCESS:
      return { ...state, jwt:action.payload.jwt , loading: false };
      case GET_USER_SUCCESS:
        return {
          ...state,
          loading: false,
          user: action.payload,
        };
  
    case GET_USER_FAILURE:
    case LOGIN_FAILURE:
    case SIGNUP_FAILURE:
      return { ...state, error: action.payload, loading: false, fetchinguser: false };  

    case LOGOUT:
      localStorage.removeItem("jwt");
      return { ...state, jwt:null, user: null };

    default:
      return state;
  }
};

export default authReducer;
