import AppLayout from "@/components/AppLayout";
import { Phone, MessageCircle, Instagram, Facebook, User } from "lucide-react";

export default function Contact() {
  return (
    <AppLayout>
      <div className="max-w-lg mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mx-auto mb-4">
            <User className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Contact the Developer</h1>
          <p className="text-sm text-muted-foreground mt-1">Muhammad Abdullah</p>
        </div>

        <div className="glass-card p-6 space-y-4 animate-slide-up">
          <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/20">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Message on WhatsApp</p>
            </div>
          </a>

          <a href="tel:" className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
              <Phone className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-xs text-muted-foreground">Call directly</p>
            </div>
          </a>

          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20">
              <Instagram className="h-5 w-5 text-pink-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Instagram</p>
              <p className="text-xs text-muted-foreground">Follow on Instagram</p>
            </div>
          </a>

          <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20">
              <Facebook className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Facebook</p>
              <p className="text-xs text-muted-foreground">Follow on Facebook</p>
            </div>
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
