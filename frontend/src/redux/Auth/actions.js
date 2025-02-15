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
    console.log("Login - Making request with:", credentials);
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    console.log("Login - Response:", response.data);

    const { data } = response;

    if (data.access_token) {
      localStorage.setItem("jwt", data.access_token);
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

export const signup = (details) => async (dispatch) => {
  dispatch(signupRequest());
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, details);
    const user = response.data;
    if (user.access_token) {
      localStorage.setItem("jwt", user.access_token);
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
      // localStorage.setItem("userId",user.)
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
  } catch (error) {
    console.error("Logout failed:", error);
  }

  dispatch({ type: LOGOUT });
};