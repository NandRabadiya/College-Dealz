import React from "react";
import { useDispatch } from "react-redux"; // Use useDispatch to access Redux dispatch
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login } from "../../redux/Auth/actions"; // Import login action

const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .refine((email) => /@(ddu\.ac\.in|gtu\.ac\.in)$/.test(email), "Email must be from @ddu.ac.in or @gtu.ac.in"), // Email validation
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    )
});

const LoginForm = ({ onSuccess, onError }) => {
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onChange"
  });

  const dispatch = useDispatch(); // Initialize dispatch

  const onSubmit = async (data) => {
    try {
      // Dispatch login action
      dispatch(login(data)); // Use data from form submission
      console.log("login form", data);
     // onSuccess("Logged in successfully!");
    } catch (error) {
      onError("Login failed");
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
