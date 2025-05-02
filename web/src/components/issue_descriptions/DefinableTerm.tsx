import React, { ReactNode } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface DefinableTermProps {
  term: string;
  definition: string;
  children?: ReactNode;
}

const DefinableTerm = ({ term, definition, children }: DefinableTermProps) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-help border-b border-dotted border-gray-700">
          {children || term}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <div className="text-sm font-semibold">{term}</div>
          <div className="text-sm text-gray-600">{definition}</div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default DefinableTerm;