// backend/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // นำเข้า middleware

module.exports = (pool) => {
    const newsController = require('../controllers/newsController')(pool);

    // Routes ที่ไม่ต้องการการยืนยันตัวตน (สำหรับ Frontend ทั่วไป)
    router.get('/', newsController.getAllNews); // ดึงข่าวสารทั้งหมด
    router.get('/:id', newsController.getNewsById); // ดึงข่าวสารตาม ID

    // Routes ที่ต้องการการยืนยันตัวตน (สำหรับ Admin Panel)
    // การสร้าง/แก้ไข/ลบข่าวสารต้องมีการ Login
    router.post('/', authMiddleware, newsController.createNews); // สร้างข่าวใหม่
    router.put('/:id', authMiddleware, newsController.updateNews); // อัปเดตข่าวสาร
    router.delete('/:id', authMiddleware, newsController.deleteNews); // ลบข่าวสาร

    return router;
};