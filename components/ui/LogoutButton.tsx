"use client";

import { signOut } from "next-auth/react";
import { Button } from "./button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  bgColor?: string;
}

export function LogoutButton({
  variant = "destructive",
  size = "default",
  bgColor = "var(--color-primary)",
  className,
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={className}
      style={{ backgroundColor: bgColor }}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}
