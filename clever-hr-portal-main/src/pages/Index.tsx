
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { session, error } = await getSession();
        
        if (error) {
          console.error("Session error:", error);
          setError("Error checking authentication status");
          return;
        }
        
        if (session) {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
        console.error("Auth check error:", err);
      }
    }
    
    checkAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center justify-center mb-6">
            <Logo size="large" />
          </div>
          
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600 mb-4">
            Please check your authentication configuration or try again later.
          </div>
          
          <Button 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Reload Application
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-pulse text-lg">Redirecting...</div>
      </div>
    </div>
  );
};

export default Index;
