
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let success;
      if (isLogin) {
        success = await login(email, password);
      } else {
        // Verify passwords match for signup
        if (password !== confirmPassword) {
          toast("Passwords don't match", {
            description: "Please make sure your passwords match."
          });
          setIsLoading(false);
          return;
        }
        
        success = await signup(name, email, password);
      }
      
      if (success) {
        navigate("/");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <h1 className="text-2xl font-bold text-finsight-purple-dark">
              FinSight<span className="ml-1 text-finsight-purple">AI</span>
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
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required={!isLogin}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-finsight-purple hover:bg-finsight-purple-dark"
              disabled={isLoading}
            >
              {isLoading ? (
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
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setIsLogin(!isLogin);
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
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
