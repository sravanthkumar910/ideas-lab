import { Toaster } from "@/components/ui/sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "glass border border-primary/20 text-foreground font-body text-sm font-semibold rounded-2xl shadow-elevated",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground rounded-xl",
          cancelButton: "bg-muted text-muted-foreground rounded-xl",
        },
      }}
    />
  );
}
