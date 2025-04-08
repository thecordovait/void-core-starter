
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { signIn } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type LocationState = {
  from?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const from = state?.from || "/dashboard";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    setErrorMessage(null);
    setIsEmailUnconfirmed(false);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setIsEmailUnconfirmed(true);
        } else {
          setErrorMessage(error.message);
        }
        throw error;
      }
      
      toast.success("Welcome back!");
      navigate(from);
    } catch (error: any) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
        {isEmailUnconfirmed && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Email not confirmed</AlertTitle>
            <AlertDescription>
              Please check your email and click the confirmation link to activate your account.
              <p className="mt-2 text-sm">
                For development purposes, you can
                <a 
                  href="https://supabase.com/dashboard/project/ncbrcytyuvftzrqonnzh/auth/providers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-1 font-medium underline"
                >
                  disable email confirmation in Supabase
                </a>.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && !isEmailUnconfirmed && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium text-hr-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
        </div>
        
        <Button
          type="submit"
          className="w-full bg-hr-primary hover:bg-hr-primary/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-hr-primary hover:underline">
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
