"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onStay,
  onDiscard,
  onSaveAndLeave,
  isSaving = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-warning">
            <div className="h-9 w-9 rounded-full bg-warning-soft flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              Discard changes?
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            You have unsaved edits on the workflow canvas. If you leave without saving, your modifications will be lost.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-4 border-t border-border mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onStay}
            disabled={isSaving}
            className="text-xs"
          >
            Stay
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDiscard}
            disabled={isSaving}
            className="text-xs text-destructive hover:bg-destructive-soft hover:text-destructive"
          >
            Discard
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onSaveAndLeave}
            disabled={isSaving}
            className="text-xs bg-primary hover:bg-primary-hover text-primary-foreground font-semibold gap-1.5"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save and leave</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
