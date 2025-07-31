// backend/controllers/dota2Controller.js (แก้ไขรับ pool)
// const dota2ApiService = require('../services/dota2ApiService'); // ลบบรรทัดนี้

// เปลี่ยนเป็นฟังก์ชันที่รับ pool เข้ามา
module.exports = (pool) => { // <-- เพิ่มบรรทัดนี้
    const dota2ApiService = require('../services/dota2ApiService')(pool); // <-- สร้าง service โดยส่ง pool

    const syncDota2Heroes = async (req, res) => {
        try {
            const heroes = await dota2ApiService.getHeroesFromOpenDota();
            const result = await dota2ApiService.saveHeroesToDb(heroes);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error syncing Dota 2 heroes:", error.message);
            res.status(500).json({ message: error.message });
        }
    };

    const syncDota2Items = async (req, res) => {
        try {
            const items = await dota2ApiService.getItemsFromOpenDota();
            const result = await dota2ApiService.saveItemsToDb(items);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error syncing Dota 2 items:", error.message);
            res.status(500).json({ message: error.message });
        }
    };

    const getDota2Heroes = async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM dota2_heroes ORDER BY localized_name ASC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Error fetching Dota 2 heroes from DB:", error.message);
            res.status(500).json({ message: 'Failed to retrieve heroes from database.' });
        }
    };

    const getDota2Items = async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM dota2_items ORDER BY localized_name ASC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error("Error fetching Dota 2 items from DB:", error.message);
            res.status(500).json({ message: 'Failed to retrieve items from database.' });
        }
    };

    return { // <-- ต้อง Return เป็น Object ของฟังก์ชัน
        syncDota2Heroes,
        syncDota2Items,
        getDota2Heroes,
        getDota2Items
    };
}; // <-- ปิดฟังก์ชัน module.exports