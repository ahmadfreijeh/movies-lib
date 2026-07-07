"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RowActionsMenuProps {
  showEdit?: boolean;
  showArchive?: boolean;
  showDelete?: boolean;
  archiveLabel?: string;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export function RowActionsMenu({
  showEdit = true,
  showArchive = true,
  showDelete = true,
  archiveLabel = "Archive",
  onEdit,
  onArchive,
  onDelete,
}: RowActionsMenuProps) {
  if (!showEdit && !showArchive && !showDelete) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showEdit && (
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        )}
        {showArchive && (
          <DropdownMenuItem onClick={onArchive}>
            {archiveLabel}
          </DropdownMenuItem>
        )}
        {showDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
