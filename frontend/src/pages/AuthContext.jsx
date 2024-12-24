// AuthContext.jsx
// This file manages authentication state and provides the login/signup dialog
import React, { createContext, useContext, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Create context for authentication state
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [user, setUser] = useState(null);

  // Simulated login function (replace with real API calls later)
  const login = async (credentials) => {
    try {
      setIsAuthenticated(true);
      setUser({ name: credentials.email });
      setShowAuthDialog(false);
      
      // Execute any pending action after successful login
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Simulated signup function (replace with real API calls later)
  const signup = async (userData) => {
    try {
      setIsAuthenticated(true);
      setUser({ name: userData.email });
      setShowAuthDialog(false);
      
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        showAuthDialog,
        setShowAuthDialog,
        setPendingAction,
        login,
        signup,
        logout
      }}
    >
      {children}
      {/* Blur overlay when auth dialog is shown */}
      {showAuthDialog && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <AuthDialog
            open={showAuthDialog}
            onOpenChange={setShowAuthDialog}
          />
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication dialog component
const AuthDialog = ({ open, onOpenChange }) => {
  const [activeTab, setActiveTab] = useState("login");
  const { login, signup } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    login({
      email: e.target.email.value,
      password: e.target.password.value,
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    signup({
      email: e.target.email.value,
      password: e.target.password.value,
      name: e.target.name.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Please login or create an account to continue
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input id="signup-name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" name="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">Sign Up</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
