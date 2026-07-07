"use client";

import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GenreMultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (genres: string[]) => void;
}

export function GenreMultiSelect({
  options,
  selected,
  onChange,
}: GenreMultiSelectProps) {
  const toggle = (genre: string) => {
    onChange(
      selected.includes(genre)
        ? selected.filter((g) => g !== genre)
        : [...selected, genre],
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-40 justify-between font-normal">
          {selected.length ? `${selected.length} genre${selected.length > 1 ? "s" : ""}` : "Genres"}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            onSelect={(e) => e.preventDefault()}
            onCheckedChange={() => toggle(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
