import * as submissionModel from '../models/submissionModel.js';

export const createSubmission = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        if (userRole !== 'user') {
            return res.status(403).json({ message: 'Only students may submit solutions' });
        }
        const { contest_id = null, problem_id, verdict } = req.body;

        if (!problem_id || !verdict) return res.status(400).json({ message: 'Missing fields' });

        if (contest_id) {
            const contest = await submissionModel.getContestById(contest_id);
            if (!contest) return res.status(400).json({ message: 'Contest not found' });

            const now = new Date();
            const start = new Date(contest.start_time);
            const end = new Date(contest.end_time);
            if (now < start || now > end) {
                return res.status(403).json({ message: 'Submissions allowed only during contest window' });
            }
            // ensure user is registered for the contest before allowing submissions
            const regRows = await submissionModel.checkContestRegistration(contest_id, userId);
            if (!regRows || regRows.length === 0) {
                return res.status(403).json({ message: 'User not registered for contest' });
            }
        }

        // Insert submission
        const result = await submissionModel.createSubmissionRecord(userId, contest_id, problem_id, verdict);

        const insertId = result.insertId;

        // do not auto-register users on submission — registration is required beforehand

        // Fetch newly created submission to return
        const submission = await submissionModel.getSubmissionWithDetails(insertId);

        res.json({ submission });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create submission' });
    }
};

export const getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user.id;
        const rows = await submissionModel.getUserSubmissionsList(userId);
        res.json({ data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
