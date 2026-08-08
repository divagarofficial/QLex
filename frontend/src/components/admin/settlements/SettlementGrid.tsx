"use client";

import { SettlementItem } from "@/services/adminSettlements";
import SettlementCard from "./SettlementCard";

interface SettlementGridProps {
  settlements: SettlementItem[];
  onViewDetails: (settlement: SettlementItem) => void;
  onProcessPayout: (settlement: SettlementItem) => void;
}

export default function SettlementGrid({
  settlements,
  onViewDetails,
  onProcessPayout,
}: SettlementGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {settlements.map((settlement) => (
        <SettlementCard
          key={settlement.id}
          settlement={settlement}
          onViewDetails={onViewDetails}
          onProcessPayout={onProcessPayout}
        />
      ))}
    </div>
  );
}
