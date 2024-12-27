import React from 'react';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import { mockAuthService } from './mockAuthService';

const Authenticate = () => {
  // State management for UI elements and authentication flow
  const [isOpen, setIsOpen] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Initialize React Hook Form for both login and signup forms
  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onChange' // Enables real-time validation
  });

  const signupForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: ''
    },
    mode: 'onChange'
  });

  // Common validation patterns
  const validationRules = {
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address'
      }
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters'
      },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        message: 'Password must include uppercase, lowercase, number and special character'
      }
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = (response) => {
    // Store authentication data
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Show success message
    setSuccessMessage('Authentication successful!');
    setErrorMessage('');
    
    // Clear forms
    loginForm.reset();
    signupForm.reset();
    
    // Close modal after a brief delay to show success message
    setTimeout(() => {
      closeModal();
    }, 1500);
  };

  // Handle authentication errors
  const handleAuthError = (error) => {
    setErrorMessage(error.message || 'An error occurred during authentication');
    setSuccessMessage('');
  };

  // Login submission handler
  const handleLogin = async (data) => {
    try {
      setIsLoading(true);
      const response = await mockAuthService.login(data);
      handleAuthSuccess(response);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup submission handler
  const handleSignup = async (data) => {
    try {
      setIsLoading(true);
      const response = await mockAuthService.signup(data);
      handleAuthSuccess(response);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth handler
  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await mockAuthService.googleAuth();
      handleAuthSuccess(response);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setIsOpen(false);

  // Form field error display component
  const FieldError = ({ error }) => {
    if (!error) return null;
    return (
      <p className="text-sm text-destructive mt-1">
        {error.message}
      </p>
    );
  };

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background with theme-aware styling */}
      <div className="absolute inset-0 bg-cover bg-center bg-muted/50">
        <img
          src="/api/placeholder/1500/1500"
          alt="Background"
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Theme-aware overlay with blur effect */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Authentication Modal */}
      {isOpen && (
        <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="text-2xl text-center">Welcome Back!</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Error/Success Messages */}
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

                {/* Login Form */}
                <TabsContent value="login">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        {...loginForm.register('email', validationRules.email)}
                      />
                      <FieldError error={loginForm.formState.errors.email} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        {...loginForm.register('password', validationRules.password)}
                      />
                      <FieldError error={loginForm.formState.errors.password} />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading || !loginForm.formState.isValid}
                    >
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </TabsContent>

                {/* Signup Form */}
                <TabsContent value="signup">
                  <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        {...signupForm.register('name', {
                          required: 'Name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters'
                          }
                        })}
                      />
                      <FieldError error={signupForm.formState.errors.name} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        {...signupForm.register('email', validationRules.email)}
                      />
                      <FieldError error={signupForm.formState.errors.email} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        {...signupForm.register('password', validationRules.password)}
                      />
                      <FieldError error={signupForm.formState.errors.password} />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isLoading || !signupForm.formState.isValid}
                    >
                      {isLoading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Divider */}
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

              {/* Google Login */}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isLoading ? 'Processing...' : 'Continue with Google'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Authenticate;





// for future use

// import React from 'react';
// import axios from 'axios';
// import { useForm } from 'react-hook-form';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { X } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// const AuthPage = () => {
//   // State management for modal and loading states
//   const [isOpen, setIsOpen] = React.useState(true);
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [errorMessage, setErrorMessage] = React.useState('');

//   // Initialize React Hook Form for login
//   const loginForm = useForm({
//     defaultValues: {
//       email: '',
//       password: ''
//     }
//   });

//   // Initialize React Hook Form for signup
//   const signupForm = useForm({
//     defaultValues: {
//       name: '',
//       email: '',
//       password: ''
//     }
//   });

//   // Email validation pattern
//   const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

//   // Handle login submission
//   const handleLogin = async (data) => {
//     try {
//       setIsLoading(true);
//       setErrorMessage('');
      
//       // Make API call to your backend login endpoint
//       const response = await axios.post('/api/login', data);
      
//       // Handle successful login
//       console.log('Login successful:', response.data);
      
//       // Here you might want to:
//       // - Store the authentication token
//       // - Update your auth context
//       // - Redirect the user
      
//     } catch (error) {
//       setErrorMessage(error.response?.data?.message || 'An error occurred during login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle signup submission
//   const handleSignup = async (data) => {
//     try {
//       setIsLoading(true);
//       setErrorMessage('');
      
//       // Make API call to your backend signup endpoint
//       const response = await axios.post('/api/signup', data);
      
//       // Handle successful signup
//       console.log('Signup successful:', response.data);
      
//       // Here you might want to:
//       // - Store the authentication token
//       // - Update your auth context
//       // - Redirect the user
      
//     } catch (error) {
//       setErrorMessage(error.response?.data?.message || 'An error occurred during signup');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle Google OAuth
//   const handleGoogleLogin = async () => {
//     try {
//       setIsLoading(true);
//       setErrorMessage('');
      
//       // Make API call to your backend Google OAuth endpoint
//       const response = await axios.get('/api/auth/google');
      
//       // Handle Google OAuth response
//       window.location.href = response.data.authUrl;
      
//     } catch (error) {
//       setErrorMessage('Failed to initialize Google login');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const closeModal = () => setIsOpen(false);

//   return (
//     <div className="relative min-h-screen bg-background">
//       {/* Background and overlay remain the same */}
//       <div className="absolute inset-0 bg-cover bg-center bg-muted/50">
//         <img
//           src="/api/placeholder/1500/1500"
//           alt="Background"
//           className="w-full h-full object-cover opacity-50"
//         />
//       </div>
//       <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

//       {isOpen && (
//         <div className="relative z-20 flex items-center justify-center min-h-screen p-4">
//           <Card className="max-w-md w-full">
//             <CardHeader className="relative">
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="absolute right-2 top-2"
//                 onClick={closeModal}
//               >
//                 <X className="h-4 w-4" />
//               </Button>
//               <CardTitle className="text-2xl text-center">Welcome Back!</CardTitle>
//               <CardDescription className="text-center">
//                 Sign in to your account or create a new one
//               </CardDescription>
//             </CardHeader>
            
//             <CardContent>
//               {/* Error message display */}
//               {errorMessage && (
//                 <Alert variant="destructive" className="mb-4">
//                   <AlertDescription>{errorMessage}</AlertDescription>
//                 </Alert>
//               )}

//               <Tabs defaultValue="login" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2 mb-4">
//                   <TabsTrigger value="login">Login</TabsTrigger>
//                   <TabsTrigger value="signup">Sign Up</TabsTrigger>
//                 </TabsList>

//                 {/* Login Form */}
//                 <TabsContent value="login">
//                   <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="login-email">Email</Label>
//                       <Input
//                         id="login-email"
//                         type="email"
//                         {...loginForm.register('email', {
//                           required: 'Email is required',
//                           pattern: {
//                             value: emailPattern,
//                             message: 'Please enter a valid email'
//                           }
//                         })}
//                       />
//                       {loginForm.formState.errors.email && (
//                         <p className="text-sm text-destructive">
//                           {loginForm.formState.errors.email.message}
//                         </p>
//                       )}
//                     </div>
                    
//                     <div className="space-y-2">
//                       <Label htmlFor="login-password">Password</Label>
//                       <Input
//                         id="login-password"
//                         type="password"
//                         {...loginForm.register('password', {
//                           required: 'Password is required',
//                           minLength: {
//                             value: 8,
//                             message: 'Password must be at least 8 characters'
//                           }
//                         })}
//                       />
//                       {loginForm.formState.errors.password && (
//                         <p className="text-sm text-destructive">
//                           {loginForm.formState.errors.password.message}
//                         </p>
//                       )}
//                     </div>

//                     <Button 
//                       type="submit" 
//                       className="w-full"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? 'Logging in...' : 'Login'}
//                     </Button>
//                   </form>
//                 </TabsContent>

//                 {/* Signup Form */}
//                 <TabsContent value="signup">
//                   <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="name">Full Name</Label>
//                       <Input
//                         id="name"
//                         type="text"
//                         {...signupForm.register('name', {
//                           required: 'Name is required',
//                           minLength: {
//                             value: 2,
//                             message: 'Name must be at least 2 characters'
//                           }
//                         })}
//                       />
//                       {signupForm.formState.errors.name && (
//                         <p className="text-sm text-destructive">
//                           {signupForm.formState.errors.name.message}
//                         </p>
//                       )}
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="signup-email">Email</Label>
//                       <Input
//                         id="signup-email"
//                         type="email"
//                         {...signupForm.register('email', {
//                           required: 'Email is required',
//                           pattern: {
//                             value: emailPattern,
//                             message: 'Please enter a valid email'
//                           }
//                         })}
//                       />
//                       {signupForm.formState.errors.email && (
//                         <p className="text-sm text-destructive">
//                           {signupForm.formState.errors.email.message}
//                         </p>
//                       )}
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor="signup-password">Password</Label>
//                       <Input
//                         id="signup-password"
//                         type="password"
//                         {...signupForm.register('password', {
//                           required: 'Password is required',
//                           minLength: {
//                             value: 8,
//                             message: 'Password must be at least 8 characters'
//                           },
//                           pattern: {
//                             value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//                             message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
//                           }
//                         })}
//                       />
//                       {signupForm.formState.errors.password && (
//                         <p className="text-sm text-destructive">
//                           {signupForm.formState.errors.password.message}
//                         </p>
//                       )}
//                     </div>

//                     <Button 
//                       type="submit" 
//                       className="w-full"
//                       disabled={isLoading}
//                     >
//                       {isLoading ? 'Signing up...' : 'Sign Up'}
//                     </Button>
//                   </form>
//                 </TabsContent>
//               </Tabs>

//               {/* Divider */}
//               <div className="relative my-4">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-border"></div>
//                 </div>
//                 <div className="relative flex justify-center text-xs uppercase">
//                   <span className="bg-card px-2 text-muted-foreground">
//                     Or continue with
//                   </span>
//                 </div>
//               </div>

//               {/* Google Login */}
//               <Button 
//                 variant="outline" 
//                 className="w-full"
//                 onClick={handleGoogleLogin}
//                 disabled={isLoading}
//               >
//                 <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
//                   <path
//                     d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                     fill="#4285F4"
//                   />
//                   <path
//                     d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                     fill="#34A853"
//                   />
//                   <path
//                     d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                     fill="#FBBC05"
//                   />
//                   <path
//                     d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                     fill="#EA4335"
//                   />
//                 </svg>
//                 {isLoading ? 'Processing...' : 'Continue with Google'}
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

