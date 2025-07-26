import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameWeekNavigationProps {
  currentGameWeek: number;
  onGameWeekChange: (gameWeek: number) => void;
  disabled?: boolean;
  maxGameWeek?: number;
}

export const GameWeekNavigation = ({ 
  currentGameWeek, 
  onGameWeekChange, 
  disabled = false,
  maxGameWeek = 38 
}: GameWeekNavigationProps) => {
  
  const handlePrevious = () => {
    if (currentGameWeek > 1 && !disabled) {
      console.log(`⬅️ Navigating to GW ${currentGameWeek - 1}`);
      onGameWeekChange(currentGameWeek - 1);
    }
  };

  const handleNext = () => {
    if (currentGameWeek < maxGameWeek && !disabled) {
      console.log(`➡️ Navigating to GW ${currentGameWeek + 1}`);
      onGameWeekChange(currentGameWeek + 1);
    }
  };

  const isPreviousDisabled = disabled || currentGameWeek <= 1;
  const isNextDisabled = disabled || currentGameWeek >= maxGameWeek;

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevious}
        disabled={isPreviousDisabled}
        className="h-6 w-6 lg:h-8 lg:w-8 p-0 hover:bg-secondary/10 disabled:opacity-40"
      >
        <ChevronLeft className="h-3 w-3 lg:h-4 lg:w-4" />
      </Button>
      
      <span className="text-xs lg:text-sm font-medium px-2 lg:px-3 whitespace-nowrap min-w-[3rem] lg:min-w-[3.5rem] text-center">
        GW {currentGameWeek}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNext}
        disabled={isNextDisabled}
        className="h-6 w-6 lg:h-8 lg:w-8 p-0 hover:bg-secondary/10 disabled:opacity-40"
      >
        <ChevronRight className="h-3 w-3 lg:h-4 lg:w-4" />
      </Button>
    </div>
  );
};