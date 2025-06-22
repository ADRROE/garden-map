import { SelectionState } from '@/stores/SelectionState';
import React from 'react';


interface StatusBarProps {
  text: string;
  status: SelectionState;
  className: string;
}

type SelectionKind = 'drawing' | 'editing' | 'placing' | 'confirming' | 'cancelling' ;

const colorMap: Record<SelectionKind, string> = {
  drawing: "bg-[#F5DA5B]",
  editing: "bg-[#F5DA5B]",
  placing: "bg-[#F5DA5B]",
  confirming: "bg-green-500",
  cancelling: "bg-red-500"
};

const StatusBar: React.FC<StatusBarProps> = ({ text, status, className }) => {
const bgClass = colorMap[status.kind as SelectionKind] ?? 'bg-gray-400';
  return (
    <div className={`fixed top-0 w-full z-50 text-black text-center py-2 font-semibold shadow-md transition-all duration-300 ${bgClass} ${className}`}>
      {text}
    </div>
  );
};

export default StatusBar;