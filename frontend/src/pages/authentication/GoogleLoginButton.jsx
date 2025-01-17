import React from "react";
import { Button } from "@/components/ui/button";

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const handleGoogleLogin = async () => {
    try {
      // Mock Google authentication call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onSuccess("Google authentication successful!");
    } catch (error) {
      onError("Google authentication failed");
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
      <img src="/google.svg" alt="Google Logo" className="h-5 w-5 mr-2" />
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
