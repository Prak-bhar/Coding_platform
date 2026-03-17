import * as feedbackModel from '../models/feedbackModel.js';
import * as contestModel from '../models/contestModel.js';

export const submitFeedback = async (req, res) => {
    try {
        const contestId = req.params.id;
        const userId = req.user.id;
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
        }

        // Validate contest exists and has finished
        const contest = await contestModel.getContestById(contestId);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        
        // Ensure user is allowed (must be a participant)
        const participant = await contestModel.getParticipant(contestId, userId);
        if (!participant) {
            return res.status(403).json({ message: 'Only registered participants can submit feedback' });
        }

        const result = await feedbackModel.submitFeedback(contestId, userId, rating, comment || '');
        res.status(result.updated ? 200 : 201).json({ success: true, message: 'Feedback submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to submit feedback' });
    }
};

export const getFeedback = async (req, res) => {
    try {
        const contestId = req.params.id;

        // Authorize: only admin or the faculty member who created the contest can view all feedback
        const contest = await contestModel.getContestById(contestId);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });

        if (req.user.role !== 'admin' && req.user.id !== contest.created_by) {
            return res.status(403).json({ message: 'Forbidden. Not authorized to view this feedback' });
        }

        const analytics = await feedbackModel.getContestFeedbackAnalytics(contestId);
        const feedbacks = await feedbackModel.getContestFeedback(contestId);

        res.json({ analytics, feedbacks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to retrieve feedback' });
    }
};
