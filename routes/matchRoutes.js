// backend/routes/matchRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // นำเข้า middleware

module.exports = (pool) => {
    const matchController = require('../controllers/matchController')(pool);

    // Routes ที่ไม่ต้องการการยืนยันตัวตน (สำหรับ Frontend ทั่วไป)
    router.get('/', matchController.getAllMatches); // ดึงการแข่งขันทั้งหมด
    router.get('/:id', matchController.getMatchById); // ดึงการแข่งขันตาม ID

    // Routes ที่ต้องการการยืนยันตัวตน (สำหรับ Admin Panel)
    router.post('/', authMiddleware, matchController.createMatch); // เพิ่มการแข่งขันใหม่
    router.put('/:id', authMiddleware, matchController.updateMatch); // อัปเดตการแข่งขัน
    router.delete('/:id', authMiddleware, matchController.deleteMatch); // ลบการแข่งขัน

    return router;
};