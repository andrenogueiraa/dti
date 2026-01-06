"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface YearNavigationProps {
  currentYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
}

export function YearNavigation({
  currentYear,
  availableYears,
  onYearChange,
}: YearNavigationProps) {
  const currentIndex = availableYears.indexOf(currentYear);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < availableYears.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      onYearChange(availableYears[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onYearChange(availableYears[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={!hasPrevious}
        className="flex items-center gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      <Select
        value={currentYear.toString()}
        onValueChange={(value) => onYearChange(parseInt(value, 10))}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Selecione o ano" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={!hasNext}
        className="flex items-center gap-1"
      >
        Próximo
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="ml-auto text-sm text-muted-foreground">
        {availableYears.length} {availableYears.length === 1 ? "ano" : "anos"} disponíveis
      </div>
    </div>
  );
}

