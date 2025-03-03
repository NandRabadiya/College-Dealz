import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

const WantlistDialog = ({ isOpen, onClose, wantlistData }) => {
  const router = useRouter();
  
  if (!wantlistData) return null;
  
  const handlePostDeal = () => {
    // Logic to navigate to post a deal page with wantlist data
    router.push(`/post-deal?wantlistId=${wantlistData.id}`);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Matching Wantlist</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-sm font-medium">Product:</div>
            <div className="col-span-2">{wantlistData.productName || "Not specified"}</div>
            
            <div className="text-sm font-medium">Category:</div>
            <div className="col-span-2">{wantlistData.category || "Not specified"}</div>
            
            <div className="text-sm font-medium">Description:</div>
            <div className="col-span-2">{wantlistData.description || "Not specified"}</div>
            
            <div className="text-sm font-medium">Price Range:</div>
            <div className="col-span-2">
              {wantlistData.priceMin && wantlistData.priceMax
                ? `$${wantlistData.priceMin} - $${wantlistData.priceMax}`
                : wantlistData.priceMin
                ? `Min $${wantlistData.priceMin}`
                : wantlistData.priceMax
                ? `Max $${wantlistData.priceMax}`
                : "Not specified"}
            </div>
            
            <div className="text-sm font-medium">Max Age:</div>
            <div className="col-span-2">
              {wantlistData.monthsOldMax
                ? `${wantlistData.monthsOldMax} months`
                : "Not specified"}
            </div>
          </div>
          
          <div className="text-sm bg-blue-50 p-3 rounded-md">
            To notify buyer about your product, post it from below button. If not posted from here, buyer might not get the notification of your product that matches his wantlist.
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePostDeal}>Post a Deal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WantlistDialog;