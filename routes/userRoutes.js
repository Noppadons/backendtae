// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // <-- นำเข้า middleware

module.exports = (pool) => {
    const userController = require('../controllers/userController')(pool);

    router.post('/register', userController.registerUser);
    router.post('/login', userController.loginUser);

    // ตัวอย่าง: Route ที่ต้องใช้ auth (เช่น ดึงข้อมูลโปรไฟล์ตัวเอง)
    // router.get('/me', authMiddleware, userController.getMe); // <-- เพิ่มในอนาคต

    return router;
};