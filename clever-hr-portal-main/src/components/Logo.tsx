
import React from "react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-3xl",
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="font-display font-bold text-hr-primary">
        <span className={`${sizeClasses[size]}`}>
          HR<span className="text-black">Portal</span>
        </span>
      </div>
    </div>
  );
};

export default Logo;
