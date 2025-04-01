import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ReportDialog = ({ type, id, onReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert("Please enter a reason for the warning");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReport(id, reason);
      setIsOpen(false);
      setReason("");
    } catch (error) {
      console.error(`Error warning ${type.toLowerCase()}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 shadow-sm"
      >
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Warn {type}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Reason for warning
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for warning this ${type.toLowerCase()}...`}
              className="w-full resize-none min-h-[120px]"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setReason("");
              }}
              disabled={isSubmitting}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !reason.trim()}
              className={isSubmitting ? "bg-primary/70" : ""}
            >
              {isSubmitting ? "Sending..." : "Send Warning"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportDialog;