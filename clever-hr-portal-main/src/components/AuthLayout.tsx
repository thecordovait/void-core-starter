
import React from "react";
import Logo from "./Logo";
import { Card } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle = "Welcome back! Please enter your details." 
}) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center auth-container p-4">
      <div className="max-w-md w-full">
        <div className="flex flex-col items-center justify-center mb-6">
          <Logo size="large" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
        </div>
        
        <Card className="bg-white shadow-lg border-0 w-full">
          <div className="p-6">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
