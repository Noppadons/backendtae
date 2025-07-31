// backend/controllers/teamController.js

// Export เป็นฟังก์ชันที่รับ pool เข้ามา
module.exports = (pool) => {
    // [CREATE] เพิ่มทีมใหม่
    const createTeam = async (req, res) => {
        const { name, game, logo_url, description } = req.body;
        if (!name || !game) {
            return res.status(400).json({ message: 'Team name and game are required.' });
        }

        try {
            const result = await pool.query(
                'INSERT INTO teams (name, game, logo_url, description) VALUES ($1, $2, $3, $4) RETURNING *',
                [name, game, logo_url, description]
            );
            res.status(201).json({
                message: 'Team created successfully',
                team: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating team:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลทีมทั้งหมด
    const getAllTeams = async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM teams ORDER BY created_at DESC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching teams:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลทีมตาม ID
    const getTeamById = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Team not found.' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching team by ID:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [UPDATE] อัปเดตข้อมูลทีม
    const updateTeam = async (req, res) => {
        const { id } = req.params;
        const { name, game, logo_url, description } = req.body;
        try {
            const result = await pool.query(
                'UPDATE teams SET name = $1, game = $2, logo_url = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
                [name, game, logo_url, description, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Team not found.' });
            }
            res.status(200).json({
                message: 'Team updated successfully',
                team: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating team:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [DELETE] ลบทีม
    const deleteTeam = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM teams WHERE id = $1 RETURNING id', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Team not found.' });
            }
            res.status(200).json({ message: 'Team deleted successfully', id: result.rows[0].id });
        } catch (error) {
            console.error('Error deleting team:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    return { // Return เป็น Object ของฟังก์ชันที่ต้องการให้เข้าถึงได้
        createTeam,
        getAllTeams,
        getTeamById,
        updateTeam,
        deleteTeam
    };
};