import React from "react";
import { Button } from "@/components/ui/button";

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
      <img src="/google.svg" alt="Google Logo" className="h-5 w-5 mr-2" />
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
