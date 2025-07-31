// backend/controllers/playerController.js

module.exports = (pool) => {
    // [CREATE] เพิ่มผู้เล่นใหม่
    const createPlayer = async (req, res) => {
        const { name, nickname, team_id, role, profile_image_url, social_media_links, stats } = req.body;
        if (!name || !nickname) {
            return res.status(400).json({ message: 'Player name and nickname are required.' });
        }

        try {
            const result = await pool.query(
                'INSERT INTO players (name, nickname, team_id, role, profile_image_url, social_media_links, stats) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [name, nickname, team_id, role, profile_image_url, social_media_links, stats]
            );
            res.status(201).json({
                message: 'Player created successfully',
                player: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating player:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลผู้เล่นทั้งหมด
    const getAllPlayers = async (req, res) => {
        try {
            // เราอาจจะ join กับตาราง teams เพื่อแสดงชื่อทีมด้วย
            const result = await pool.query(`
                SELECT p.*, t.name AS team_name
                FROM players p
                LEFT JOIN teams t ON p.team_id = t.id
                ORDER BY p.created_at DESC
            `);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching players:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลผู้เล่นตาม ID
    const getPlayerById = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query(`
                SELECT p.*, t.name AS team_name
                FROM players p
                LEFT JOIN teams t ON p.team_id = t.id
                WHERE p.id = $1
            `, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Player not found.' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching player by ID:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [UPDATE] อัปเดตข้อมูลผู้เล่น
    const updatePlayer = async (req, res) => {
        const { id } = req.params;
        const { name, nickname, team_id, role, profile_image_url, social_media_links, stats } = req.body;
        try {
            const result = await pool.query(
                'UPDATE players SET name = $1, nickname = $2, team_id = $3, role = $4, profile_image_url = $5, social_media_links = $6, stats = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
                [name, nickname, team_id, role, profile_image_url, social_media_links, stats, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Player not found.' });
            }
            res.status(200).json({
                message: 'Player updated successfully',
                player: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating player:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [DELETE] ลบผู้เล่น
    const deletePlayer = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM players WHERE id = $1 RETURNING id', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Player not found.' });
            }
            res.status(200).json({ message: 'Player deleted successfully', id: result.rows[0].id });
        } catch (error) {
            console.error('Error deleting player:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    return {
        createPlayer,
        getAllPlayers,
        getPlayerById,
        updatePlayer,
        deletePlayer
    };
};