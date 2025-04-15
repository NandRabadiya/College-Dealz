import axios from "axios";
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
import { API_BASE_URL } from "../../pages/Api/api";
import { AUTH_STATE_CHANGE_EVENT } from '../../pages/navbar/NavBar'; // Adjust the import path as needed


// Login Action
export const loginRequest = () => ({ type: LOGIN_REQUEST });
export const loginSuccess = (user) => ({ type: LOGIN_SUCCESS, payload: user });
export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const login = (credentials) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    console.log("Login - Making request with:", credentials);
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    console.log("Login - Response:", response.data);

    const { data } = response;

    if (data.access_token) {
      localStorage.setItem("jwt", data.access_token);
      window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT));
      dispatch(loginSuccess({ user: data }));
      try {
        const userResponse = await axios.get(
          `${API_BASE_URL}/api/users/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );
        console.log("User details fetched:", userResponse.data);
        localStorage.setItem("userId", userResponse.data.id);
        dispatch({ type: GET_USER_SUCCESS, payload: userResponse.data });
      } catch (error) {
        console.error("Error fetching user details:", error);
        dispatch({ type: GET_USER_FAILURE, payload: error.message });
      }
      console.log("Login - Success dispatched");
      return { type: "LOGIN_SUCCESS" };
    } else {
      throw new Error("No access token received");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed";
    dispatch(loginFailure(errorMessage));
    return { type: "LOGIN_FAILURE", payload: { message: errorMessage } };
  }
};

// Signup Action
export const signupRequest = () => ({ type: SIGNUP_REQUEST });
export const signupSuccess = (user) => ({
  type: SIGNUP_SUCCESS,
  payload: user,
});
export const signupFailure = (error) => ({
  type: SIGNUP_FAILURE,
  payload: error,
});

// Modified signup action to include OTP verification
export const signup = (details) => async (dispatch) => {
  dispatch(signupRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, {
      ...details,
      verified: true // Add this flag to indicate OTP verification is complete
    });
    const user = response.data;
    if (user.access_token) {
      localStorage.setItem("jwt", user.access_token);
      window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT));
      dispatch(getUser(user.access_token));
    }
    dispatch(signupSuccess({ user, message: user.message || "Signup successful!" }));
    return { type: "SIGNUP_SUCCESS" };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Signup failed";
    dispatch(signupFailure(errorMessage));
    return { type: "SIGNUP_FAILURE", payload: { message: errorMessage } };
  }
};

//  get user from token
export const getUser = (token) => {
  return async (dispatch) => {
    dispatch({ type: GET_USER_REQUEST });
    try {
      console.log("token", token);
      const response = await axios.get(`${API_BASE_URL}/api/users/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data;
      localStorage.setItem("userId", user.id);
      dispatch({ type: GET_USER_SUCCESS, payload: user });
      console.log("req User ", user);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to get user details";
      dispatch({ type: GET_USER_FAILURE, payload: errorMessage });
    }
  };
};

// Logout Action
// export const logout = () => ({ type: LOGOUT });

export const logout = () => async (dispatch) => {
  const token = localStorage.getItem("jwt");

  if (!token) {
    dispatch({ type: LOGOUT });
    return;
  }

  try {
    await axios.post(`${API_BASE_URL}/logout`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Clear token from local storage
    localStorage.removeItem("jwt");
    localStorage.removeItem("isAdminView");
    localStorage.removeItem("userId");
    window.dispatchEvent(new CustomEvent(AUTH_STATE_CHANGE_EVENT));
  } catch (error) {
    console.error("Logout failed:", error);
  }

  dispatch({ type: LOGOUT });
};

// Send OTP Action
export const sendOtpRequest = () => ({ type: SEND_OTP_REQUEST });
export const sendOtpSuccess = (message) => ({ type: SEND_OTP_SUCCESS, payload: message });
export const sendOtpFailure = (error) => ({ type: SEND_OTP_FAILURE, payload: error });

export const sendOtp = (email) => async (dispatch) => {
  dispatch(sendOtpRequest());
  try {
    console.log("Sending OTP to:", email);
    const params = new URLSearchParams({ email });
    const response = await axios.post(`${API_BASE_URL}/send-otp?${params}`);
    console.log("OTP sent:", response.data);
    const responseMessage = response.data.response || response.data.message || "OTP sent successfully";

    // If the response indicates the email is already registered, trigger failure action
    if (responseMessage === "Your Email is already registered Try Login") {
        dispatch(sendOtpFailure(responseMessage));
        return { type: "SEND_OTP_FAILURE", payload: { message: responseMessage } };
    }
    
    dispatch(sendOtpSuccess(responseMessage));
    return { type: "SEND_OTP_SUCCESS", payload: response.data };
    
  } catch (error) {
    console.error('OTP Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    const errorMessage = error.response?.data?.message || "Failed to send OTP";
    dispatch(sendOtpFailure(errorMessage));
    return { type: "SEND_OTP_FAILURE", payload: { message: errorMessage } };
  }
};

// Resend OTP Action
export const resendOtp = (email) => async (dispatch) => {
  dispatch(sendOtpRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/resend-otp`, null, {
      params: { email }
    });
    dispatch(sendOtpSuccess(response.data.message || "OTP resent successfully"));
    return { type: "SEND_OTP_SUCCESS", payload: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to resend OTP";
    dispatch(sendOtpFailure(errorMessage));
    return { type: "SEND_OTP_FAILURE", payload: { message: errorMessage } };
  }
};

// Verify OTP Action
export const verifyOtpRequest = () => ({ type: VERIFY_OTP_REQUEST });
export const verifyOtpSuccess = (message) => ({ type: VERIFY_OTP_SUCCESS, payload: message });
export const verifyOtpFailure = (error) => ({ type: VERIFY_OTP_FAILURE, payload: error });

export const verifyOtp = (email, otp) => async (dispatch) => {
  dispatch(verifyOtpRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/verify`, null, {
      params: { email, otp }
    });
    dispatch(verifyOtpSuccess(response.data.message || "OTP verified successfully"));
    return { type: "VERIFY_OTP_SUCCESS", payload: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to verify OTP";
    dispatch(verifyOtpFailure(errorMessage));
    return { type: "VERIFY_OTP_FAILURE", payload: { message: errorMessage } };
  }
};
