import { SpinnerGap } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: number;
}

export const Spinner = ({ className, size = 20 }: SpinnerProps) => {
  return <SpinnerGap size={size} className={cn("animate-spin text-primary", className)} />;
};

export default Spinner;