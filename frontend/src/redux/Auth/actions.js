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
} from "./ActionTypes";
import { API_BASE_URL } from "../../pages/Api/api";

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
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    const user = response.data;
    //console.log("user",user);
    if (user.access_token) {
      localStorage.setItem("jwt", user.access_token);
      dispatch(getUser(user.access_token));
    }
    // Display success message from backend
    const message = user.message || "Login successful!";
    dispatch(loginSuccess({ user, message }));
  } catch (error) {
    dispatch(loginFailure(error.response?.data?.message || "Login failed"));
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

export const signup = (details) => async (dispatch) => {
  dispatch(signupRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, details);
    const user = response.data;
    if (user.acces_token) {
      localStorage.setItem("jwt", user.acces_token);
      dispatch(getUser(user.acces_token));
    }
    // Display success message from backend
    const message = user.message || "Signup successful!";
    dispatch(signupSuccess({ user, message }));
  } catch (error) {
    dispatch(signupFailure(error.response?.data?.message || "Signup failed"));
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
      dispatch({ type: GET_USER_SUCCESS, payload: user });
      console.log("req User ", user);
    } catch (error) {
      const errorMessage = error.message;
      dispatch({ type: GET_USER_FAILURE, payload: errorMessage });
    }
  };
};

// Logout Action
export const logout = () => ({ type: LOGOUT });
