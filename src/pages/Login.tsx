import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/auth";
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
import {
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  Info,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  const [isBiometricLoading, setBiometricLoading] = useState(false);

  const {
    login,
    signup,
    loading: authLoading,
    loginWithBiometrics,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[Login] User already authenticated, redirecting to home");
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Check if WebAuthn is supported by the browser
    if (window.PublicKeyCredential !== undefined) {
      // Check if we have a stored email and biometrics are registered
      const savedUserStr = localStorage.getItem("finsight_user");
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser?.email) {
            setEmail(savedUser.email);
            setIsBiometricsAvailable(true);
          }
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }
    }
  }, []);

  // --- UPDATED handleSubmit with robust error handling ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormLoading || authLoading) {
      return;
    }

    setIsFormLoading(true);
    setErrorMessage("");

    try {
      const normalizedEmail = email.toLowerCase();

      if (isLogin) {
        // 1. Try Supabase login directly (for better error visibility)
        const { error: directAuthError } =
          await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

        if (directAuthError) {
          // Email not confirmed (special case)
          if (
            directAuthError.message.toLowerCase().includes("email not confirmed")
          ) {
            setErrorMessage(
              "Your email address is not verified. Please check your inbox for the verification email."
            );
            toast.error("Email not verified", {
              description:
                "Please check your inbox for the verification email.",
            });
          } else {
            setErrorMessage(
              directAuthError.message ||
                "Login failed. Please check your credentials and try again."
            );
            toast.error("Login failed", {
              description:
                directAuthError.message ||
                "Please check your credentials and try again.",
            });
          }
          return; // Don't continue to context login
        }

        // 2. Context login (may trigger more setup)
        try {
          const success = await login(normalizedEmail, password);
          if (!success) {
            setErrorMessage(
              "Login failed. Please check your credentials and try again."
            );
            toast.error("Login failed", {
              description: "Please check your credentials and try again.",
            });
          } else {
            navigate("/");
          }
        } catch (loginError) {
          setErrorMessage("Login failed. Unexpected error—please try again.");
          toast.error("Login failed", {
            description: "Unexpected error—please try again.",
          });
        }
      } else {
        // Signup flow
        if (password !== confirmPassword) {
          setErrorMessage("Passwords don't match.");
          toast.error("Passwords don't match", {
            description: "Please make sure your passwords match.",
          });
          return;
        }

        try {
          const success = await signup(name, normalizedEmail, password);
          if (!success) {
            setErrorMessage(
              "Signup failed. Email might already be in use or there was a server error."
            );
            toast.error("Signup failed", {
              description: "Email might be in use or server error.",
            });
          } else {
            toast.success("Account created successfully!", {
              description: "Please check your inbox for verification email.",
            });
          }
          // navigate happens in useEffect
        } catch (signupError) {
          setErrorMessage("Signup failed. Unexpected error—please try again.");
          toast.error("Signup failed", {
            description: "Unexpected error—please try again.",
          });
        }
      }
    } catch (error) {
      // This should only catch truly unexpected errors (network, etc)
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error(isLogin ? "Login failed" : "Signup failed", {
        description: "Unexpected error. Please try again.",
      });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address",
      });
      return;
    }

    if (isBiometricLoading || authLoading) {
      return;
    }

    setBiometricLoading(true);
    setErrorMessage("");

    try {
      const normalizedEmail = email.toLowerCase();
      const success = await loginWithBiometrics(normalizedEmail);

      if (success) {
        navigate("/");
      } else {
        setErrorMessage(
          "Biometric authentication failed. Please try again or use password."
        );
        toast.error("Biometric login failed", {
          description: "Please try again or use your password",
        });
      }
    } catch (error) {
      setErrorMessage(
        "Biometric authentication failed. Please use your password instead."
      );
      toast.error("Biometric login failed", {
        description: "Please use your password instead",
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  const isButtonDisabled = isFormLoading || authLoading;
  const isBiometricButtonDisabled = isBiometricLoading || authLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <h1 className="text-2xl font-bold text-finsight-purple-dark">
              FinSight
              <span className="ml-1 text-finsight-purple">AI</span>
            </h1>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">
            {isLogin ? "Login" : "Sign Up"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin
              ? "Enter your credentials to access your account"
              : "Create a new account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 text-sm bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLogin && (
            <div className="p-3 text-sm bg-blue-50 border border-blue-100 rounded flex items-center gap-2 text-blue-700">
              <Info className="h-4 w-4 flex-shrink-0" />
              <span>
                If your email hasn't been verified, please check your inbox for
                the verification email or try signing up with a new account.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isButtonDisabled}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isButtonDisabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-sm text-finsight-purple hover:underline"
                    disabled={isButtonDisabled}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isButtonDisabled}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required={!isLogin}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isButtonDisabled}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-finsight-purple hover:bg-finsight-purple-dark"
              disabled={isButtonDisabled}
            >
              {isButtonDisabled ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  {isLogin ? "Logging in..." : "Signing up..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      Login
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </>
                  )}
                </span>
              )}
            </Button>

            {isLogin && isBiometricsAvailable && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-finsight-purple text-finsight-purple hover:bg-finsight-purple/10 transition-colors"
                  onClick={handleBiometricLogin}
                  disabled={isBiometricButtonDisabled}
                >
                  {isBiometricButtonDisabled ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-finsight-purple border-t-transparent"></div>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Fingerprint className="h-5 w-5" />
                      Login with Biometrics
                    </span>
                  )}
                </Button>
                <p className="mt-1 text-xs text-center text-gray-500">
                  Use your fingerprint, face recognition or security key for
                  faster login
                </p>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-finsight-purple hover:bg-finsight-purple/10"
            onClick={() => {
              setIsLogin(!isLogin);
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
              setErrorMessage("");
              setIsFormLoading(false); // Reset loading state when toggling
            }}
            disabled={isButtonDisabled || isBiometricButtonDisabled}
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Login"}
          </Button>
          <div className="text-sm text-gray-500 text-center">
            <div className="flex items-center justify-center gap-1">
              <Lock className="h-4 w-4" />
              Secure {isLogin ? "login" : "signup"}
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
