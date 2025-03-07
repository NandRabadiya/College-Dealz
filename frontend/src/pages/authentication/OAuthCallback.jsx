import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../Api/api";

const OAuthCallback = () => {
    console.log("Callback called ")
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("jwt", token);
      axios
        .get(`${API_BASE_URL}/api/users/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("User details:", response.data);
          navigate("/dashboard"); // Redirect to the dashboard
        })
        .catch((error) => {
          console.error("Error fetching user details:", error);
          navigate("/Authenticate"); // Redirect back to login on failure
        });
    } else {
      navigate("/Authenticate"); // Redirect to login if no token is found
    }
  }, []);

  return <div>Processing login...</div>;
};

export default OAuthCallback;


