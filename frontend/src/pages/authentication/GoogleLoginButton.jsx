import React from "react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "../Api/api";

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    document.cookie = "G_AUTHUSER_H=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "G_AUTHUSER=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google?prompt=select_account&access_type=offline`;
  };
  
  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
      <img src="/google.svg" alt="Google Logo" className="h-5 w-5 mr-2" />
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
