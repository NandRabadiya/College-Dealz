import React from "react";
import { Mail, Trash2, MessageSquare, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast"; // ✅ Use toast directly

const FeedbackCard = ({ item, onDelete }) => {
  const handleContactUser = () => {
    if (!item.email) {
      toast({
        title: "Contact Failed",
        description: "Email address not available for this user",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent("Regarding your feedback on our platform");
    const body = encodeURIComponent(
      `Dear ${item.name},\n\nThank you for your feedback.\n\nYour feedback message: "${item.message}"\n\nWe would like to address your concerns.\n\nBest regards,\nAdmin Team`
    );

    window.open(`mailto:${item.email}?subject=${subject}&body=${body}`, "_blank");

    toast({
      title: "Email client opened",
      description: `Composing email to ${item.name} at ${item.email}`,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <span className="text-primary dark:text-primary-foreground font-semibold text-lg">
              {item.name ? item.name.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.email || "Email not available"}
              </p>
            </div>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
            <ThumbsUp
              className={`h-4 w-4 mr-1 ${
                item.star > 0 ? "text-yellow-500" : "text-gray-400 dark:text-gray-500"
              }`}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.star}/5
            </span>
          </div>
        </div>
        <div className="relative">
          <MessageSquare className="absolute top-0 left-0 h-4 w-4 text-gray-300 dark:text-gray-600" />
          <p className="pl-6 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {item.message}
          </p>
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary/90 hover:bg-primary/10 transition-colors duration-200"
            onClick={handleContactUser}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact User
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
