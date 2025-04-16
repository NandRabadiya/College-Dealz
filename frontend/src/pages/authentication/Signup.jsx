import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  signup,
  sendOtp,
  verifyOtp,
  resendOtp,
} from "../../redux/Auth/actions";

const allowedDomains = ["ddu.ac.in", "gtu.ac.in", "gmail.com"];
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (email) => allowedDomains.some((domain) => email.endsWith(`@${domain}`)),
      `Email must be from one of the following domains: ${allowedDomains.join(
        ", "
      )}`
    ),
  otp: z.string().length(6, "OTP must be 6 digits").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

const SignupForm = ({ onSuccess, onError }) => {
  const [step, setStep] = useState("initial");
  const [otpSent, setOtpSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // New state for form submission
  const [showPassword, setShowPassword] = useState(false); // State for password visibility toggle

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(signup(data));
      if (resultAction.type === "SIGNUP_SUCCESS") {
        onSuccess("Account created successfully! Redirecting to dashboard...");
        reset();
      } else {
        onError(resultAction.payload?.message || "Signup failed");
      }
    } catch (error) {
      onError("Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOTP = async () => {
    const email = watch("email");
    if (!email || errors.email) return;

    setIsSubmitting(true); // Disable buttons during OTP send
    try {
      const result = await dispatch(sendOtp(email));
      if (result.type === "SEND_OTP_SUCCESS") {
        setOtpSent(true);
        setStep("otp");
        startCountdown();
      } else if (
        result.type === "SEND_OTP_FAILURE" &&
        result.payload?.message === "Your Email is already registered Try Login"
      ) {
        onError(result.payload.message); // Show error message
        return; // Stop further processing
      } else {
        onError(result.payload?.message || "Failed to send OTP");
      }
    } catch (error) {
      onError("Failed to send OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    const email = watch("email");
    const otp = watch("otp");
    if (!otp || errors.otp) return;

    setIsSubmitting(true); // Disable buttons during OTP verification
    try {
      const result = await dispatch(verifyOtp(email, otp));
      if (result.type === "VERIFY_OTP_SUCCESS") {
        setStep("password");
        onSuccess(result.payload?.message || "OTP verified successfully");
      } else {
        onError(result.payload?.message || "Failed to verify OTP");
      }
    } catch (error) {
      onError("Failed to verify OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    const email = watch("email");
    setIsResending(true);
    setIsSubmitting(true); // Disable buttons during OTP resend
    try {
      const result = await dispatch(resendOtp(email));
      if (result.type === "SEND_OTP_SUCCESS") {
        startCountdown();
        onSuccess(result.payload?.message || "OTP resent successfully");
      } else {
        onError(result.payload?.message || "Failed to resend OTP");
      }
    } finally {
      setIsResending(false);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          disabled={isSubmitting}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            disabled={isSubmitting}
            {...register("email")}
          />
          <Button
            type="button"
            onClick={handleSendOTP}
            disabled={
              !watch("email") || !!errors.email || otpSent || isSubmitting
            }
            className="whitespace-nowrap"
          >
            {isSubmitting ? "Sending..." : "Send OTP"}
          </Button>
        </div>
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      {step === "otp" && otpSent && (
        <div className="space-y-2">
          <Label htmlFor="otp">Enter OTP</Label>
          <div className="flex gap-2">
            <Input
              id="otp"
              type="text"
              maxLength={6}
              disabled={isSubmitting}
              {...register("otp")}
            />
            <Button
              type="button"
              onClick={handleVerifyOTP}
              disabled={!watch("otp") || !!errors.otp || isSubmitting}
              className="whitespace-nowrap"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0 || isSubmitting}
              className="text-sm"
            >
              {isResending
                ? "Resending..."
                : countdown > 0
                ? `Resend in ${countdown}s`
                : "Resend OTP"}
            </Button>
            {otpSent && (
              <p className="text-sm text-muted-foreground">OTP sent to your email</p>
            )}
          </div>
          {errors.otp && (
            <p className="text-sm text-destructive mt-1">{errors.otp.message}</p>
          )}
        </div>
      )}

      {step === "password" && otpSent && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              disabled={isSubmitting}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)} // Toggle password visibility
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
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
