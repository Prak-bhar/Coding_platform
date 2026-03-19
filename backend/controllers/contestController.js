import * as contestModel from '../models/contestModel.js';

/* GET /api/contests */
export const getContests = async (req, res) => {
  try {
    const { role, department_id } = req.user;
    const rows = await contestModel.getContestsList(role, department_id);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contests' });
  }
};

/* GET /api/contests/:id */
export const getContestById = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userRole = req.user.role;
    const userDept = req.user.department_id;

    const { contest, problems, forbidden } = await contestModel.getContestAndProblems(contestId, userRole, userDept);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (forbidden) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ contest, problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contest' });
  }
};

/* ✅ FIXED: GET /api/contests/:id/submissions
   Filters: user_id, user_name (partial), verdict, problem_title
   Only includes submissions within contest window
*/
export const getContestSubmissions = async (req, res) => {
  try {
    const contestId = req.params.id;
    const { user_id, user_name, verdict, problem_id, problem_title, limit = 500, offset = 0 } = req.query;

    const contest = await contestModel.getContestById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const filters = { user_id, user_name, verdict, problem_id, problem_title };
    const rows = await contestModel.getSubmissionsInContest(contestId, contest.start_time, contest.end_time, filters, limit, offset);

    res.json({ submissions: rows, contest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contest submissions' });
  }
};

/* Leaderboard */
export const getContestLeaderboard = async (req, res) => {
  try {
    const contestId = req.params.id;
    const contest = await contestModel.getContestById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const rows = await contestModel.getLeaderboardData(contestId, contest.start_time, contest.end_time);

    let rank = 0;
    let lastKey = null;
    const leaderboard = rows.map((r, i) => {
      const key = `${r.solved_count}_${r.penalty}`;
      if (key !== lastKey) {
        rank = i + 1;
        lastKey = key;
      }
      return { rank, ...r };
    });

    res.json({ leaderboard, contest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute leaderboard' });
  }
};

/* Contest Problems (unchanged except better structure) */
export const getContestProblems = async (req, res) => {
  try {
    const contestId = req.params.id;
    const { role, department_id: userDept } = req.user;

    const { contest, problems } = await contestModel.getContestProblemsAccessible(contestId, role, userDept);
    if (!contest) return res.status(404).json({ message: 'Contest not found or not accessible' });

    const now = new Date();
    if (role !== 'admin' && now < new Date(contest.start_time)) {
      return res.status(403).json({ message: 'Contest has not started yet' });
    }

    res.json({ contest, problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch contest problems' });
  }
};

// add to src/controllers/contestController.js

// GET /api/contests/:id/participants
export const getContestParticipants = async (req, res) => {
  try {
    const contestId = req.params.id;

    const contest = await contestModel.getContestById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const { participants, registered } = await contestModel.getParticipantsAndMe(contestId, req.user.id);
    const rows = participants;

    res.json({ participants: rows, registered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch participants' });
  }
};

// PUT /api/contests/:id/participants/:userId/rating
export const updateParticipantRating = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.params.userId;
    const { rating_after } = req.body;

    if (typeof rating_after === 'undefined') {
      return res.status(400).json({ message: 'rating_after is required' });
    }

    const contest = await contestModel.getContestById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    if (req.user.role !== 'admin' && req.user.id !== contest.created_by) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const participant = await contestModel.getParticipant(contestId, userId);
    if (!participant) return res.status(404).json({ message: 'Participant not found' });

    if (participant.rating_after !== null && typeof participant.rating_after !== 'undefined') {
      return res.status(400).json({ message: 'Rating already set and cannot be changed' });
    }

    const updatedCp = await contestModel.updateParticipantRatingRecord(contestId, userId, rating_after);

    res.json({ participant: updatedCp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update participant rating' });
  }
};

// GET /api/contests/:id/summary
export const getContestSummary = async (req, res) => {
  try {
    const contestId = req.params.id;
    const contest = await contestModel.getContestById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const endTime = contest.end_time || new Date();
    const participantsCount = await contestModel.getParticipantCount(contestId);
    const solversCount = await contestModel.getSolverCount(contestId, contest.start_time, endTime);
    const rows = await contestModel.getContestSummaryStats(contestId, contest.start_time, endTime);

    const summary = rows.map((r) => {
      const submissions = Number(r.submissions) || 0;
      const ac_count = Number(r.ac_count) || 0;
      const unique_solvers = Number(r.unique_solvers) || 0;
      const avg_submissions_to_ac = r.avg_submissions_to_ac ? Number(r.avg_submissions_to_ac) : null;
      const success_rate = participantsCount > 0 ? unique_solvers / participantsCount : 0;
      return { ...r, submissions, ac_count, unique_solvers, avg_submissions_to_ac, success_rate };
    });

    let hardestProblem = null;
    let easiestProblem = null;
    if (summary.length > 0) {
      const byRate = [...summary].sort((a, b) => a.success_rate - b.success_rate);
      hardestProblem = byRate[0];
      easiestProblem = byRate[byRate.length - 1];
    }

    const percent_solvers = participantsCount > 0 ? (solversCount / participantsCount) * 100 : 0;

    res.json({
      summary,
      participantsCount,
      solversCount,
      percent_solvers,
      hardestProblem,
      easiestProblem,
      contest
    });
  } catch (err) {
    console.error('getContestSummary error:', err);
    res.status(500).json({ message: 'Failed to fetch contest summary' });
  }
};

// POST /api/contests/:id/register
export const registerForContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user.id;

    const contest = await contestModel.getContestById(contestId);
    if (!contest) return res.status(404).json({ message: 'Contest not found' });

    const now = new Date();
    const start = new Date(contest.start_time);
    const end = new Date(contest.end_time);

    if (now > end) return res.status(403).json({ message: 'Contest already finished' });

    const rows = await contestModel.registerParticipant(contestId, userId);

    res.json({ registered: true, participants: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register for contest' });
  }
};
