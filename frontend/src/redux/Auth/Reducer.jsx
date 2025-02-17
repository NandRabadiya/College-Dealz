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
  SEND_OTP_REQUEST,
  SEND_OTP_SUCCESS,
  SEND_OTP_FAILURE,
  VERIFY_OTP_REQUEST,
  VERIFY_OTP_SUCCESS,
  VERIFY_OTP_FAILURE
} from "./ActionTypes";

const initialState = {
  user: null,
  loading: false,
  error: null,
  jwt: null,
  isAuthenticated: false,
  otpStatus: null,
  otpVerified: false
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case SIGNUP_REQUEST:
    case GET_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
    case SIGNUP_SUCCESS:
      return {
        ...state,
        jwt: action.payload.user.access_token,
        isAuthenticated: true,
        loading: false,
        error: null,
        user: action.payload.user,
      };
    case GET_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        isAuthenticated: true,
        error: null,
      };

    case GET_USER_FAILURE:
    case LOGIN_FAILURE:
    case SIGNUP_FAILURE:
      return {
        ...state,
        error: action.payload,
        loading: false,
        isAuthenticated: false,
        user: null,
        jwt: null,
      };

    case LOGOUT:
      localStorage.removeItem("jwt");
      return {
        ...initialState,
      };
  //   default:
  //     return state;
  // }
  case SEND_OTP_REQUEST:
    case VERIFY_OTP_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        otpStatus: null
      };

    case SEND_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        otpStatus: action.payload
      };

    case VERIFY_OTP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        otpVerified: true,
        otpStatus: action.payload
      };

    case SEND_OTP_FAILURE:
    case VERIFY_OTP_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        otpStatus: null
      };

    // ... (keep remaining cases)

    default:
      return state;
    }

};

export default authReducer;
