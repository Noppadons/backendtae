// backend/controllers/newsController.js

module.exports = (pool) => {
    // [CREATE] สร้างข่าวใหม่
    const createNews = async (req, res) => {
        const { title, content, image_url, author_id } = req.body; // author_id ควรมาจาก req.user.id จาก token
        
        // ตรวจสอบข้อมูลที่จำเป็น
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required for news.' });
        }

        try {
            // เราจะใช้ author_id ที่มาจาก token ของผู้ดูแลระบบที่ Login อยู่
            // ถ้าไม่ได้ส่ง author_id มาใน body ก็จะใช้ req.user.id
            const finalAuthorId = author_id || req.user.id; // ใช้ ID จาก token เป็นหลัก

            const result = await pool.query(
                'INSERT INTO news (title, content, image_url, author_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [title, content, image_url, finalAuthorId]
            );
            res.status(201).json({
                message: 'News created successfully',
                news: result.rows[0]
            });
        } catch (error) {
            console.error('Error creating news:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลข่าวสารทั้งหมด
    const getAllNews = async (req, res) => {
        try {
            // ดึงข้อมูลข่าวพร้อมชื่อผู้เขียน (ถ้ามี)
            const result = await pool.query(`
                SELECT n.*, u.username AS author_username
                FROM news n
                LEFT JOIN users u ON n.author_id = u.id
                ORDER BY n.published_date DESC
            `);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching news:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [READ] ดึงข้อมูลข่าวสารตาม ID
    const getNewsById = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query(`
                SELECT n.*, u.username AS author_username
                FROM news n
                LEFT JOIN users u ON n.author_id = u.id
                WHERE n.id = $1
            `, [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'News not found.' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching news by ID:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [UPDATE] อัปเดตข้อมูลข่าวสาร
    const updateNews = async (req, res) => {
        const { id } = req.params;
        const { title, content, image_url } = req.body; // author_id ไม่ควรเปลี่ยนในการอัปเดต
        try {
            const result = await pool.query(
                'UPDATE news SET title = $1, content = $2, image_url = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
                [title, content, image_url, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'News not found.' });
            }
            res.status(200).json({
                message: 'News updated successfully',
                news: result.rows[0]
            });
        } catch (error) {
            console.error('Error updating news:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // [DELETE] ลบข่าวสาร
    const deleteNews = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'News not found.' });
            }
            res.status(200).json({ message: 'News deleted successfully', id: result.rows[0].id });
        } catch (error) {
            console.error('Error deleting news:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    return {
        createNews,
        getAllNews,
        getNewsById,
        updateNews,
        deleteNews
    };
};