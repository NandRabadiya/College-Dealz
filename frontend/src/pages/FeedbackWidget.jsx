import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "./Api/api";

const FeedbackWidget = () => {
  const [showStars, setShowStars] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [rating, setRating] = useState(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRating = (value) => {
    setRating(value);
    setShowMessageBox(true);
  };
  const submitFeedback = async () => {
    const authToken = localStorage.getItem("jwt");
    if (!authToken) {
      setError("You need to be logged in to submit feedback");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(
        `${API_BASE_URL}/api/feedback/`,
        { star: rating, message: message.trim() || "N/A" },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setSubmitted(true);
      setTimeout(() => {
        setShowStars(false);
        setShowMessageBox(false);
        setSubmitted(false);
        setRating(null);
        setMessage("");
      }, 2500);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showStars && (
        <button
          onClick={() => setShowStars(true)}
          className="bg-primary/80 hover:bg-primary text-white dark:bg-primary/90 dark:hover:bg-primary rounded-full p-3 shadow-lg transition-colors duration-200"
          aria-label="Open feedback form"
        >
          ⭐
        </button>
      )}

      {showStars && (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 w-64">
          <div className="flex justify-between items-center mb-3">
            <p className="text-foreground font-medium">Rate Us:</p>
            <button
              onClick={() => setShowStars(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Close feedback form"
            >
              ×
            </button>
          </div>

          <div className="flex justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRating(star)}
                className={`text-2xl mx-1 transition-colors ${
                  star <= rating
                    ? "text-amber-400 dark:text-amber-300"
                    : "text-muted-foreground/40 hover:text-muted-foreground/70"
                }`}
                aria-label={`Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>

          {showMessageBox && (
            <div className="mt-3">
              <textarea
                placeholder="Leave a message (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                rows={3}
              />
              <button
                onClick={submitFeedback}
                disabled={loading || !rating}
                className="w-full bg-primary/90 hover:bg-primary text-primary-foreground px-4 py-2 mt-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-2 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          {submitted && (
            <div className="mt-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
              Thanks for your feedback!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;
