"use client";

import { useState, useEffect, Suspense } from "react";
import {
  handleSignUp,
  handleConfirmSignUp,
  handleSignIn,
} from "@/lib/actions/amplifyAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define schema for sign up form validation
const signUpSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }), // Email field with email validation
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }), // Password field with minimum length validation
    confirmPassword: z.string(), // Confirm password field
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Define schema for sign in form validation
const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }), // Email field with email validation
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }), // Password field with minimum length validation
});

// Define schema for confirmation form validation
const confirmSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Confirmation code must be at least 6 characters" }), // Confirmation code field with minimum length validation
});

// Component function for sign up, confirmation, and sign in
export default function Component() {
  const [step, setStep] = useState<"signup" | "confirm" | "signin">("signup");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form setup for sign up, sign in, and confirmation
  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const confirmForm = useForm<z.infer<typeof confirmSchema>>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      code: "",
    },
  });

  // Effect to handle redirect URL
  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectUrl(redirect);
    }
  }, [searchParams]);

  // Function to handle sign up form submission
  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setError(null);
    try {
      const { isSignUpComplete, nextStep } = await handleSignUp({
        username: values.email,
        password: values.password,
        email: values.email,
      });

      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        signInForm.setValue("email", values.email);
        setStep("confirm");
      } else if (isSignUpComplete) {
        router.push("/sign-in");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setError("Sign up failed. Please try again.");
    }
  };

  // Function to handle confirmation form submission
  const onConfirm = async (values: z.infer<typeof confirmSchema>) => {
    setError(null);
    try {
      const isSignUpComplete = await handleConfirmSignUp(
        signInForm.getValues("email"),
        values.code
      );

      if (isSignUpComplete) {
        router.push(redirectUrl);
      }
    } catch (error) {
      console.error("Confirmation error:", error);
      setError("Confirmation failed. Please try again.");
    }
  };

  // Function to handle sign in form submission
  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setError(null);
    try {
      const { nextStep } = await handleSignIn(values.email, values.password);
      if (nextStep.signInStep === "DONE") router.push("/");
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Sign in failed. Please try again.");
    }
  };

  // JSX for rendering sign up, confirmation, and sign in forms
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex justify-center items-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>
                {step === "confirm" ? "Confirm Sign Up" : "Authentication"}
              </CardTitle>
              <CardDescription>
                {step === "confirm"
                  ? "Enter the confirmation code sent to your email"
                  : "Sign up or sign in to your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === "confirm" ? (
                <Form {...confirmForm}>
                  <form
                    onSubmit={confirmForm.handleSubmit(onConfirm)}
                    className="space-y-4"
                  >
                    <FormField
                      control={confirmForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmation Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter confirmation code"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {error && (
                      <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button className="w-full" type="submit">
                      Confirm
                    </Button>
                  </form>
                </Form>
              ) : (
                <Tabs
                  defaultValue="signup"
                  onValueChange={(value) =>
                    setStep(value as "signup" | "signin")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signup">
                    <Form {...signUpForm}>
                      <form
                        onSubmit={signUpForm.handleSubmit(onSignUp)}
                        className="space-y-4"
                      >
                        <FormField
                          control={signUpForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="Enter your email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signUpForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <EyeIcon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signUpForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={
                                      showConfirmPassword ? "text" : "password"
                                    }
                                    placeholder="Confirm your password"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                  >
                                    {showConfirmPassword ? (
                                      <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <EyeIcon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {error && (
                          <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Button className="w-full" type="submit">
                          Sign Up
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                  <TabsContent value="signin">
                    <Form {...signInForm}>
                      <form
                        onSubmit={signInForm.handleSubmit(onSignIn)}
                        className="space-y-4"
                      >
                        <FormField
                          control={signInForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="Enter your email"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={signInForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                  />
                                  <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                  >
                                    {showPassword ? (
                                      <EyeOffIcon className="h-5 w-5 text-muted-foreground" />
                                    ) : (
                                      <EyeIcon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                  </button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {error && (
                          <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <Button className="w-full" type="submit">
                          Sign In
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              {step === "confirm" && (
                <Button variant="link" onClick={() => setStep("signup")}>
                  Back to Sign Up
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </Suspense>
  );
}
