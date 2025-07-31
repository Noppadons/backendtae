// backend/routes/playerRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // นำเข้า middleware

module.exports = (pool) => {
    const playerController = require('../controllers/playerController')(pool);

    // Routes ที่ไม่ต้องการการยืนยันตัวตน (สำหรับ Frontend ทั่วไป)
    router.get('/', playerController.getAllPlayers); // ดึงผู้เล่นทั้งหมด
    router.get('/:id', playerController.getPlayerById); // ดึงผู้เล่นตาม ID

    // Routes ที่ต้องการการยืนยันตัวตน (สำหรับ Admin Panel)
    router.post('/', authMiddleware, playerController.createPlayer); // เพิ่มผู้เล่นใหม่
    router.put('/:id', authMiddleware, playerController.updatePlayer); // อัปเดตผู้เล่น
    router.delete('/:id', authMiddleware, playerController.deletePlayer); // ลบผู้เล่น

    return router;
};