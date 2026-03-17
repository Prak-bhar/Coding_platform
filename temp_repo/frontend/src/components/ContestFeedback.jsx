import React, { useState, useEffect } from 'react';
import api from '../api';

export default function ContestFeedback({ contest, token, user }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Admin / Faculty State
  const [feedbackData, setFeedbackData] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const canManage = user?.role === 'admin' || user?.id === contest.created_by;

  useEffect(() => {
    // Organizers load all feedback
    if (canManage) {
      loadFeedbackAnalytics();
    }
  }, [canManage, contest.id]);

  const loadFeedbackAnalytics = async () => {
    setLoadingFeedback(true);
    try {
      const data = await api.fetchContestFeedback(token, contest.id);
      setFeedbackData(data);
    } catch (err) {
      console.error('Failed to load feedback analytics', err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setMessage({ text: 'Please log in.', type: 'error' });
    
    setSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      await api.submitContestFeedback(token, contest.id, { rating, comment });
      setMessage({ text: 'Feedback submitted successfully. Thank you!', type: 'success' });
      setComment('');
      // If organizer submits, refresh list
      if (canManage) loadFeedbackAnalytics();
    } catch (err) {
      setMessage({ text: err?.message || 'Failed to submit feedback', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 
        STUDENT VIEW: Submit Feedback 
        Only show form if user is logged in. 
        Note: The backend validates if they actually participated.
      */}
      {user && (
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4">Rate this Contest</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1 muted">Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`w-10 h-10 rounded-full font-bold transition-colors ${
                      rating === num 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 muted">Comments (Optional)</label>
              <textarea
                className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500"
                rows="3"
                placeholder="What did you think of the problems?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              className={`btn ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'btn-primary'}`}
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            
            {message.text && (
              <div className={`mt-3 p-3 rounded-md text-sm ${
                message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {message.text}
              </div>
            )}
          </form>
        </div>
      )}

      {/* ORGANIZER VIEW: Analytics & Responses */}
      {canManage && (
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-6">Feedback Analytics</h3>
          
          {loadingFeedback ? (
            <div className="muted">Loading analytics...</div>
          ) : feedbackData ? (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {feedbackData.analytics?.total_feedback || 0}
                  </div>
                  <div className="text-xs uppercase tracking-wider muted mt-1">Total Responses</div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {Number(feedbackData.analytics?.average_rating || 0).toFixed(1)}
                  </div>
                  <div className="text-xs uppercase tracking-wider muted mt-1">Average Rating</div>
                </div>
              </div>

              {/* Detailed Feedback List */}
              <div className="mt-8">
                <h4 className="font-semibold text-lg mb-4 cursor-pointer" onClick={loadFeedbackAnalytics}>
                  Individual Responses (↻ Refresh)
                </h4>
                {feedbackData.feedbacks?.length > 0 ? (
                  <div className="space-y-4">
                    {feedbackData.feedbacks.map((fb) => (
                      <div key={fb.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{fb.user_name}</span>
                          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {fb.rating} / 5
                          </span>
                        </div>
                        <p className="text-sm dark:text-gray-300 whitespace-pre-wrap">{fb.comment || <em className="text-gray-500">No comment provided.</em>}</p>
                        <div className="text-xs text-gray-400 mt-2 text-right">
                          {new Date(fb.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No feedback submitted yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="muted border border-red-200 bg-red-50 text-red-600 p-4 rounded">
              Failed to load analytics data.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
