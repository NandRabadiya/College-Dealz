import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import LoginForm from "./Login";
import SignupForm from "./Signup";
import GoogleLoginButton from "./GoogleLoginButton";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const Authenticate = ({ isOpen, onClose }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const from = location.state?.from || "/";

  console.log("Authenticate - location state:", location.state);
  console.log("Authenticate - isAuthenticated:", isAuthenticated);

  // React.useEffect(() => {
  //   if (isAuthenticated) {
  //     console.log("Authenticate - redirecting to:", from);
  //     navigate(from, { replace: true });
  //   }
  // }, [isAuthenticated, navigate, location]);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // const handleAuthSuccess = (message) => {
  //   setSuccessMessage(message);
  //   setErrorMessage("");
  //   const redirectProductId = sessionStorage.getItem("redirectProductId");
  //   if (redirectProductId) {
  //     sessionStorage.removeItem("redirectProductId"); // Clean up
  //     navigate(`/product/${redirectProductId}`);
  //   }
  //   //navigate(from, { replace: true });
  // };
  const handleAuthSuccess = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");
    navigate("/", { replace: true });
  };
  const handleAuthError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
  };
  const handleClose = () => {
    if (onClose) {
      onClose(); // Call the existing onClose function if provided
    }
    // Navigate back to the previous page
    navigate(-1);
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
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-2xl text-center">Welcome Back!</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )} */}
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
                onSuccess={(message) => handleAuthSuccess(message)}
                onError={(err) => handleAuthError(err)}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignupForm
                onSuccess={(message) => handleAuthSuccess(message)}
                onError={(err) => handleAuthError(err)}
              />
            </TabsContent>
          </Tabs>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <GoogleLoginButton
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Authenticate;
