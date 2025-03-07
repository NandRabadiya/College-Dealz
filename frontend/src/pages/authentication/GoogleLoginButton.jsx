// import React from "react";
// import { Button } from "@/components/ui/button";
// import { API_BASE_URL } from "../Api/api";

// const GoogleLoginButton = () => {
//   const handleGoogleLogin = () => {
//     document.cookie = "G_AUTHUSER_H=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     document.cookie = "G_AUTHUSER=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     window.location.href = `${API_BASE_URL}/oauth2/authorization/google?prompt=select_account&access_type=offline`;
//   };
  
//   return (
//     <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
//       <img src="/google.svg" alt="Google Logo" className="h-5 w-5 mr-2" />
//       Continue with Google
//     </Button>
//   );
// };

// export default GoogleLoginButton;
import React from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "../Api/api";
import { useLocation } from "react-router-dom";
import axios from "axios";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const location = useLocation();
  
  const handleGoogleLogin = () => {
    try {
      // Clear any existing Google auth cookies
      document.cookie = "G_AUTHUSER_H=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "G_AUTHUSER=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Store current location for redirect after login
      const currentPath = location.pathname;
      if (currentPath !== "/login" && currentPath !== "/signup" && currentPath !== "/") {
        sessionStorage.setItem("loginRedirectPath", currentPath);
      }
      
      // Get any product ID from URL if on a product page
      const productIdMatch = currentPath.match(/\/product\/(\d+)/);
      if (productIdMatch && productIdMatch[1]) {
        sessionStorage.setItem("redirectProductId", productIdMatch[1]);
      }
      console.log("Google login redirect path: ", currentPath);
     
      // No need to modify the Google OAuth URL - let the backend handle it
       window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
       console.log("Google login initiated:", window.location.href);
     
      // If there is a success callback, call it
      
    } catch (error) {
      console.error("Google login error:", error);
      if (onError) {
        onError("Failed to initiate Google login");
      }
    }
  };
  
  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center" 
      onClick={handleGoogleLogin}
    >
      <img src="/google.svg" alt="Google Logo" className="h-5 w-5 mr-2" />
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;