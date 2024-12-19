"use client";

import { useEffect, useState } from "react";
import { signIn, signUp } from "./actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [signInState, setSignInState] = useState({
    pending: false,
    success: false,
    message: "",
  });
  const [signUpState, setSignUpState] = useState({
    pending: false,
    success: false,
    message: "",
  });

  const router = useRouter();

  const signInAction = async (formData: FormData) => {
    setSignInState({ ...signInState, pending: true });
    const result = await signIn(formData);
    setSignInState({
      pending: false,
      success: result.success,
      message: result.message,
    });

    if (result.success) {
      router.push("/protected"); // Redirect to the protected page
    }
  };

  const signUpAction = async (formData: FormData) => {
    setSignUpState({ ...signUpState, pending: true });
    const result = await signUp(formData);
    setSignUpState({
      pending: false,
      success: result.success,
      message: result.message,
    });
  };

  useEffect(() => {
    if (signInState.success) {
      router.push("/protected"); // Ensure redirection on successful sign-in
    }
  }, [signInState.success, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form action={signInAction}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username">Username</Label>
                    <Input
                      id="signin-username"
                      name="username"
                      type="username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={signInState.pending}
                  >
                    {signInState.pending ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </form>
              {signInState.message && (
                <p
                  className={`mt-4 text-sm ${
                    signInState.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {signInState.message}
                </p>
              )}
            </TabsContent>
            <TabsContent value="signup">
              <form action={signUpAction}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      name="username"
                      type="username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password
                    </Label>
                    <Input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                  </div>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={signUpState.pending}
                  >
                    {signUpState.pending ? "Signing Up..." : "Sign Up"}
                  </Button>
                </div>
              </form>
              {signUpState.message && (
                <p
                  className={`mt-4 text-sm ${
                    signUpState.success ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {signUpState.message}
                </p>
              )}
            </TabsContent>
          </Tabs>
          <p className="text-sm text-center text-gray-500 mt-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
