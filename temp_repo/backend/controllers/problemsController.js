import * as problemModel from '../models/problemModel.js';

export const getProblems = async (req, res) => {
    try {
        const { tags, difficulty, page = 1, limit = 20, q } = req.query;
        const offset = (page - 1) * limit;

        const rows = await problemModel.getProblemsWithStats(difficulty, q, limit, offset);

        if (tags) {
            const tagList = tags
                .split(',')
                .map((t) => t.trim().toLowerCase())
                .filter(Boolean);
            if (tagList.length) {
                const filtered = [];
                for (const p of rows) {
                    const ptags = await problemModel.getTagsForProblem(p.id);
                    const names = ptags.map((x) => x.name.toLowerCase());
                    const hasAll = tagList.every((t) => names.includes(t));
                    if (hasAll) filtered.push(p);
                }
                return res.json({ data: filtered });
            }
        }

        // Filter visibility
        const visible = rows
            .filter((r) => r.visible === 1 || r.visible === true)
            .filter((r) => r.is_visible_now == 1);

        res.json({ data: visible });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
