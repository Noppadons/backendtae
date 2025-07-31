// backend/controllers/matchController.js

module.exports = (pool) => {
    // [CREATE] เพิ่มการแข่งขันใหม่
    const createMatch = async (req, res) => {
        const { team1_id, team2_id, game, match_date, result, stream_link } = req.body;
        
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!team1_id || !team2_id || !game || !match_date) {
            return res.status(400).json({ message: 'Team IDs, game, and match date are required.' });
        }

        try {
            const resultQuery = await pool.query(
                'INSERT INTO matches (team1_id, team2_id, game, match_date, result, stream_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [team1_id, team2_id, game, match_date, result, stream_link]
            );
            res.status(201).json({
                message: 'Match created successfully',
                match: resultQuery.rows[0]
            });
        } catch (error) {
            console.error('Error creating match:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลการแข่งขันทั้งหมด
    const getAllMatches = async (req, res) => {
        try {
            // ดึงข้อมูลการแข่งขันพร้อมชื่อทีม
            const result = await pool.query(`
                SELECT 
                    m.*, 
                    t1.name AS team1_name, 
                    t2.name AS team2_name
                FROM matches m
                LEFT JOIN teams t1 ON m.team1_id = t1.id
                LEFT JOIN teams t2 ON m.team2_id = t2.id
                ORDER BY m.match_date DESC
            `);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching matches:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลการแข่งขันตาม ID
    const getMatchById = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query(`
                SELECT 
                    m.*, 
                    t1.name AS team1_name, 
                    t2.name AS team2_name
                FROM matches m
                LEFT JOIN teams t1 ON m.team1_id = t1.id
                LEFT JOIN teams t2 ON m.team2_id = t2.id
                WHERE m.id = $1
            `, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Match not found.' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching match by ID:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [UPDATE] อัปเดตข้อมูลการแข่งขัน
    const updateMatch = async (req, res) => {
        const { id } = req.params;
        const { team1_id, team2_id, game, match_date, result, stream_link } = req.body;
        try {
            const resultQuery = await pool.query(
                'UPDATE matches SET team1_id = $1, team2_id = $2, game = $3, match_date = $4, result = $5, stream_link = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
                [team1_id, team2_id, game, match_date, result, stream_link, id]
            );
            if (resultQuery.rows.length === 0) {
                return res.status(404).json({ message: 'Match not found.' });
            }
            res.status(200).json({
                message: 'Match updated successfully',
                match: resultQuery.rows[0]
            });
        } catch (error) {
            console.error('Error updating match:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [DELETE] ลบการแข่งขัน
    const deleteMatch = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM matches WHERE id = $1 RETURNING id', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Match not found.' });
            }
            res.status(200).json({ message: 'Match deleted successfully', id: result.rows[0].id });
        } catch (error) {
            console.error('Error deleting match:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    return {
        createMatch,
        getAllMatches,
        getMatchById,
        updateMatch,
        deleteMatch
    };
};