import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/Auth/actions"; // Import your action

const OAuth2RedirectHandler = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token"); // Token from backend
    const error = urlParams.get("error");

    if (token) {
      localStorage.setItem("jwt", token);
      dispatch(loginSuccess({ user: { access_token: token } }));
      window.location.href = "/"; // Redirect to home or dashboard
    } else if (error) {
      console.error("OAuth error:", error);
    }
  }, [dispatch]);

  return <div>Redirecting...</div>;
};

export default OAuth2RedirectHandler;
