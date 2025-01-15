import React from "react";
import { useDispatch } from "react-redux"; // Use useDispatch for Redux actions
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signup } from "../../redux/Auth/actions"; // Import signup action

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
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

const SignupForm = ({ onSuccess, onError }) => {
  const { register, handleSubmit, formState: { errors, isValid, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange"
  });

  const dispatch = useDispatch(); // Initialize dispatch

  const onSubmit = async (data) => {
    try {
      // Dispatch signup action
      dispatch(signup(data)); // Pass the data to signup action
      onSuccess("Account created successfully!");
    } catch (error) {
      onError("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" type="text" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

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
        {isSubmitting ? "Signing up..." : "Sign Up"}
      </Button>
    </form>
  );
};

export default SignupForm;
