// backend/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // <-- นำเข้า middleware

module.exports = (pool) => {
    const teamController = require('../controllers/teamController')(pool);

    // Routes ที่ไม่ต้องการการยืนยันตัวตน (สำหรับ Frontend ทั่วไป - ใครก็เรียกดูได้)
    router.get('/', teamController.getAllTeams); // GET /api/teams
    router.get('/:id', teamController.getTeamById); // GET /api/teams/:id

    // ใช้ authMiddleware สำหรับ Route ที่ต้องการการยืนยันตัวตน (สำหรับ Admin Panel)
    router.post('/', authMiddleware, teamController.createTeam); // POST /api/teams
    router.put('/:id', authMiddleware, teamController.updateTeam); // PUT /api/teams/:id
    router.delete('/:id', authMiddleware, teamController.deleteTeam); // DELETE /api/teams/:id

    return router;
};