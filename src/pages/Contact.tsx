import AppLayout from "@/components/AppLayout";
import { User } from "lucide-react";

export default function Contact() {
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mx-auto mb-4">
            <User className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Always Here to Help</h1>
          <p className="text-sm text-muted-foreground mt-1">Text us anytime for quick support and guidance</p>
        </div>

        <div className="glass-card p-6 space-y-3 animate-slide-up text-center">
          <p className="text-sm text-muted-foreground">We are always available for your support.</p>
          <p className="text-lg font-semibold text-foreground">+92 303 9682244</p>
          <p className="text-sm text-muted-foreground">Send a message anytime and we will respond as soon as possible.</p>
        </div>
      </div>
    </AppLayout>
  );
}
