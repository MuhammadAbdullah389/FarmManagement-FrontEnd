import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Search, Edit } from "lucide-react";

export default function UpdateChoice() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (date) {
      navigate(`/records/1/edit`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto mt-12">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mx-auto mb-4">
            <Edit className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Update Record</h1>
          <p className="text-sm text-muted-foreground mt-1">Select a date to find and update an existing record</p>
        </div>

        <div className="glass-card p-6 animate-slide-up">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Select Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-secondary border-border"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Search className="h-4 w-4" /> Find Record
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
