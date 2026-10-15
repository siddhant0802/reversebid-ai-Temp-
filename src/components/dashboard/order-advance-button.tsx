import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { type Order, ORDER_STAGES, orderStageIndex } from "@/lib/mock-data";
import { advanceOrder } from "@/lib/store";

export function OrderAdvanceButton({ order }: { order: Order }) {
  const idx = orderStageIndex(order);
  if (idx >= ORDER_STAGES.length - 1) {
    return (
      <Button variant="outline" size="sm" disabled>
        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Order completed
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      className="bg-gradient-to-r from-primary to-accent"
      onClick={() => {
        const u = advanceOrder(order.id);
        if (u) toast.success(`${u.id} → ${u.currentStage}`, { description: `Progress ${u.progress}% · ${u.status}` });
      }}
    >
      <ChevronRight className="h-3.5 w-3.5 mr-1" /> {ORDER_STAGES[idx + 1]}
    </Button>
  );
}

