import React from "react";
import FeedbackCard from "./FeedbackCard";

const FeedbackTab = ({ feedback, handleDeleteFeedback }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          User Feedback
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <span className="font-medium">Total: {feedback.length}</span>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="font-medium">
            Avg Rating:{" "}
            <span className="text-yellow-500">
              {(
                feedback.reduce((acc, item) => acc + item.star, 0) /
                  feedback.length || 0
              ).toFixed(1)}
            </span>
            /5
          </span>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No feedback received yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedback.map((item) => (
            <FeedbackCard 
              key={item.id} 
              item={item} 
              onDelete={handleDeleteFeedback} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackTab;
