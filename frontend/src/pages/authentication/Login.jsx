import React from "react";
import { useDispatch } from "react-redux"; // Use useDispatch to access Redux dispatch
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "../../redux/Auth/actions"; // Import login action

const allowedDomains = ["ddu.ac.in", "gtu.ac.in", "gmail.com"];
const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine(
      (email) => allowedDomains.some((domain) => email.endsWith(`@${domain}`)),
      `Email must be from one of the following domains: ${allowedDomains.join(", ")}`
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});


const LoginForm = ({ onSuccess, onError }) => {
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });

  const dispatch = useDispatch(); // Initialize dispatch

  const onSubmit = async (data) => {
    try {
      const resultAction = await dispatch(login(data)); // Wait for the Redux action to resolve
      if (resultAction.type === "LOGIN_SUCCESS") { // Check action type for success
        onSuccess("Logged in successfully!"); // Call success callback
      } else {
        onError(resultAction.payload?.message || "Login failed"); // Call error callback
      }
    } catch (error) {
      onError("Login failed"); // Fallback error
    }
  };
  

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !isValid}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
};

export default LoginForm;
