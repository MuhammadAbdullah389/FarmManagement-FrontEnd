import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Github, Globe, Send, Code2 } from "lucide-react";

export default function Contact() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Contact & Support</h1>
          <p className="text-sm text-muted-foreground">Get in touch or report an issue</p>
        </div>

        <div className="grid gap-6">
          {/* Developer Info */}
          <div className="glass-card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Code2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Developer</h2>
                <p className="text-sm text-muted-foreground">FarmFlow Development Team</p>
              </div>
            </div>
            <div className="space-y-3">
              <a href="mailto:support@farmflow.dev" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" /> support@farmflow.dev
              </a>
              <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" /> github.com/farmflow
              </a>
              <a href="#" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-4 w-4" /> farmflow.dev
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card p-6 animate-slide-up">
            <h2 className="text-lg font-semibold text-foreground mb-4">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Subject</Label>
                <Input placeholder="What's this about?" className="h-10 bg-secondary border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Message</Label>
                <Textarea placeholder="Describe your issue or feedback..." className="min-h-[120px] bg-secondary border-border resize-none" />
              </div>
              <Button type="submit" size="sm">
                <Send className="h-3.5 w-3.5" /> Send Message
              </Button>
            </form>
          </div>

          {/* App Info */}
          <div className="glass-card p-5 animate-slide-up">
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">App Info</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Version</p>
                <p className="font-medium text-foreground">2.0.0</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="font-medium text-foreground">Web Application</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stack</p>
                <p className="font-medium text-foreground">React + TypeScript</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">License</p>
                <p className="font-medium text-foreground">MIT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
