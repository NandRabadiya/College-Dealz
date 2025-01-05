import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import LoginForm from "./Login";
import SignupForm from "./Signup";
import GoogleLoginButton from "./GoogleLoginButton";


console.log("Hello");
const Authenticate = ({ isOpen, onClose }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleAuthSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");
    setTimeout(() => onClose(), 1500);
  };

  const handleAuthError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="relative z-20 flex items-center justify-center min-h-screen p-4 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-md w-full">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl text-center">Welcome Back!</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                onSuccess={() => handleAuthSuccess("Logged in successfully!")}
                onError={(err) => handleAuthError(err)}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm
                onSuccess={() => handleAuthSuccess("Account created successfully!")}
                onError={(err) => handleAuthError(err)}
              />
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <GoogleLoginButton onSuccess={handleAuthSuccess} onError={handleAuthError} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Authenticate;
