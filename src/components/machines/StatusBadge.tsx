import { MachineStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<MachineStatus, { label: string; variant: "free" | "busy" | "reserved" | "maintenance"; pulse: boolean }> = {
  free: { label: "Livre", variant: "free", pulse: true },
  busy: { label: "Ocupado", variant: "busy", pulse: false },
  reserved: { label: "Reservado", variant: "reserved", pulse: false },
  maintenance: { label: "Manutenção", variant: "maintenance", pulse: false },
};

interface StatusBadgeProps {
  status: MachineStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} pulse={config.pulse} className={className}>
      {config.label}
    </Badge>
  );
}
