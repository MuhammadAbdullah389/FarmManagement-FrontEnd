import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle } from "lucide-react";

export default function UpdateChoice() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-md mx-auto mt-12">
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mx-auto mb-4">
            <Edit className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Update a Record</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose what you'd like to do</p>
        </div>

        <div className="space-y-4 animate-slide-up">
          <button
            onClick={() => navigate("/records/update/existing")}
            className="glass-card p-6 w-full text-left hover:border-primary/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/20 transition-colors">
                <Edit className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Change Existing Record</h3>
                <p className="text-sm text-muted-foreground">Edit an already saved entry by date</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/records/update/new")}
            className="glass-card p-6 w-full text-left hover:border-accent/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary group-hover:bg-accent/20 transition-colors">
                <PlusCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Insert New Record</h3>
                <p className="text-sm text-muted-foreground">Create a new entry for the current month only</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
