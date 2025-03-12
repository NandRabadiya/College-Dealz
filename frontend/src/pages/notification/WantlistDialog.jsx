import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const WantlistDialog = ({ isOpen, onClose, wantlistData }) => {
  const navigate = useNavigate();
  
  if (!wantlistData) return null;
  
  const handlePostDeal = () => {
    // Logic to navigate to post a deal page with wantlist data
    navigate(`/post-a-deal?wantlistId=${wantlistData.id}`);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">Sell Your Matching Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="text-sm font-medium dark:text-gray-300">Product:</div>
            <div className="col-span-2 dark:text-gray-200">{wantlistData.productName || "Not specified"}</div>
            
            <div className="text-sm font-medium dark:text-gray-300">Category:</div>
            <div className="col-span-2 dark:text-gray-200">{wantlistData.category || "Not specified"}</div>
            
            <div className="text-sm font-medium dark:text-gray-300">Description:</div>
            <div className="col-span-2 dark:text-gray-200">{wantlistData.description || "Not specified"}</div>
            
            <div className="text-sm font-medium dark:text-gray-300">Price Range:</div>
            <div className="col-span-2 dark:text-gray-200">
              {wantlistData.priceMin && wantlistData.priceMax
                ? `₹${wantlistData.priceMin} - ₹${wantlistData.priceMax}`
                : wantlistData.priceMin
                ? `Min ₹${wantlistData.priceMin}`
                : wantlistData.priceMax
                ? `Max ₹${wantlistData.priceMax}`
                : "Not specified"}
            </div>
            
            <div className="text-sm font-medium dark:text-gray-300">Max Age:</div>
            <div className="col-span-2 dark:text-gray-200">
              {wantlistData.monthsOldMax
                ? `${wantlistData.monthsOldMax} months`
                : "Not specified"}
            </div>
          </div>
          
          <div className="text-xs bg-blue-50 dark:bg-blue-900/40 p-3 rounded-md dark:text-gray-200">
            <ul className="list-disc pl-3">
              <li>Post your product using the button below to notify the buyer.</li>
              <li>If not posted here, the buyer might not get notified about your product.</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handlePostDeal} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">Post Deal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WantlistDialog;