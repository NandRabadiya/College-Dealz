// import React from "react";
// import { useDispatch } from "react-redux"; // Use useDispatch for Redux actions
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { signup } from "../../redux/Auth/actions"; // Import signup action

// const signupSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   email: z
//     .string()
//     .email("Invalid email address")
//     .refine((email) => /@(ddu\.ac\.in|gtu\.ac\.in)$/.test(email), "Email must be from @ddu.ac.in or @gtu.ac.in"), // Email validation
//   password: z
//     .string()
//     .min(8, "Password must be at least 8 characters")
//     .regex(
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
//       "Password must include uppercase, lowercase, number, and special character"
//     )
// });

// const SignupForm = ({ onSuccess, onError }) => {
//   const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
//     resolver: zodResolver(signupSchema),
//     mode: "onChange"
//   });

//   const dispatch = useDispatch(); // Initialize dispatch

//   const onSubmit = async (data) => {
//     try {
//       const resultAction = await dispatch(signup(data)); // Wait for the Redux action to resolve
//       if (resultAction.type === "SIGNUP_SUCCESS") { // Check action type for success
//         onSuccess("Account created successfully!"); // Call success callback
//       } else {
//         onError(resultAction.payload?.message || "Signup failed"); // Call error callback
//       }
//     } catch (error) {
//       onError("Signup failed"); // Fallback error
//     }
//   };
  

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="name">Full Name</Label>
//         <Input id="name" type="text" {...register("name")} />
//         {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="email">Email</Label>
//         <Input id="email" type="email" {...register("email")} />
//         {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="password">Password</Label>
//         <Input id="password" type="password" {...register("password")} />
//         {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
//       </div>

//       <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
//         {isSubmitting ? "Signing up..." : "Sign Up"}
//       </Button>
//     </form>
//   );
// };

// export default SignupForm;
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signup } from "../../redux/Auth/actions";

const allowedDomains = ["ddu.ac.in", "gtu.ac.in"];
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (email) => allowedDomains.some((domain) => email.endsWith(`@${domain}`)),
      `Email must be from one of the following domains: ${allowedDomains.join(", ")}`
    ),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    )
});

const SignupForm = ({ onSuccess, onError }) => {
  const [step, setStep] = useState("initial");
  const [otpSent, setOtpSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { register, handleSubmit, formState: { errors, isValid, isSubmitting }, watch } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  const dispatch = useDispatch();

  const startCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    const email = watch("email");
    if (!email || errors.email) return;
    
    try {
      setOtpSent(true);
      setStep("otp");
      startCountdown();
    } catch (error) {
      onError("Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    const otp = watch("otp");
    if (!otp || errors.otp) return;

    try {
      setStep("password");
    } catch (error) {
      onError("Failed to verify OTP");
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await handleSendOTP();
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(signup(data));
      if (resultAction.type === "SIGNUP_SUCCESS") {
        onSuccess("Account created successfully!");
      } else {
        onError(resultAction.payload?.message || "Signup failed");
      }
    } catch (error) {
      onError("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          type="text" 
          {...register("name")} 
        />
        {errors.name && 
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        }
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="flex gap-2">
          <Input 
            id="email" 
            type="email" 
            {...register("email")} 
          />
          <Button 
            type="button"
            onClick={handleSendOTP}
            disabled={!watch("email") || !!errors.email || otpSent}
            className="whitespace-nowrap"
          >
            Send OTP
          </Button>
        </div>
        {errors.email && 
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        }
      </div>

      {step === "otp" && (
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <div className="flex gap-2">
            <Input 
              id="otp" 
              type="text" 
              maxLength={6}
              {...register("otp")}
            />
            <Button 
              type="button"
              onClick={handleVerifyOTP}
              disabled={!watch("otp") || !!errors.otp}
              className="whitespace-nowrap"
            >
              Verify OTP
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
              className="text-sm"
            >
              {isResending ? "Resending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </Button>
            {otpSent && <p className="text-sm text-muted-foreground">OTP sent to your email</p>}
          </div>
          {errors.otp && 
            <p className="text-sm text-destructive mt-1">{errors.otp.message}</p>
          }
        </div>
      )}

      {step === "password" && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            {...register("password")}
          />
          {errors.password && 
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          }
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </Button>
        </div>
      )}
    </form>
  );
};

export default SignupForm;