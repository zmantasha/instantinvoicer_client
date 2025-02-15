import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string | null;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={cn("text-sm text-red-500 mt-1", className)}>
      {message}
    </div>
  );
}
