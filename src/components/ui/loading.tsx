
import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "skeleton";
  fullPage?: boolean;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  className,
  size = "md",
  variant = "spinner",
  fullPage = false,
  text
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const containerClasses = fullPage
    ? "fixed inset-0 flex flex-col items-center justify-center bg-background/80 z-50"
    : "flex flex-col items-center justify-center";

  return (
    <div className={cn(containerClasses, className)}>
      {variant === "spinner" ? (
        <div 
          className={cn(
            "animate-spin rounded-full border-4 border-primary border-t-transparent",
            sizeClasses[size]
          )}
          role="status"
          aria-label="Loading"
        />
      ) : (
        <Skeleton 
          className={cn(
            "rounded-full",
            sizeClasses[size]
          )}
        />
      )}
      
      {text && (
        <p className="mt-2 text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

export default Loading;
