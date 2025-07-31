// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // ดึง token ออกมาจาก header (ปกติจะอยู่ในรูปแบบ "Bearer TOKEN_STRING")
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // แยก "Bearer " ออกไป เอาเฉพาะ token string
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // ตรวจสอบ token ด้วย JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // เก็บข้อมูล user (id, role) ที่ได้จาก token ไว้ใน req.user เพื่อให้ route handler อื่นๆ ใช้ต่อได้
        req.user = decoded;
        next(); // เรียก next() เพื่อส่งต่อ request ไปยัง route handler ถัดไป
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
    }
};