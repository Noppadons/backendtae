// backend/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Export เป็นฟังก์ชันที่รับ pool เข้ามา
module.exports = (pool) => {
    // Register User (สำหรับสร้าง Super Admin ครั้งแรก หรือ Admin อื่นๆ)
    const registerUser = async (req, res) => {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        try {
            // ตรวจสอบว่า username มีอยู่แล้วหรือไม่
            const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // เข้ารหัสรหัสผ่าน
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // เพิ่มผู้ใช้ใหม่ลงในฐานข้อมูล
            const newUser = await pool.query(
                'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
                [username, hashedPassword, role || 'editor'] // ค่าเริ่มต้นเป็น 'editor' ถ้าไม่ได้ระบุ
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: newUser.rows[0]
            });

        } catch (error) {
            console.error('Error registering user:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    // Login User
    const loginUser = async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Please enter all fields' });
        }

        try {
            // ค้นหาผู้ใช้จาก username
            const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

            if (user.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const foundUser = user.rows[0];

            // เปรียบเทียบรหัสผ่าน
            const isMatch = await bcrypt.compare(password, foundUser.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // สร้าง JWT Token
            const token = jwt.sign(
                { id: foundUser.id, role: foundUser.role },
                process.env.JWT_SECRET,
                { expiresIn: '1h' } // Token หมดอายุใน 1 ชั่วโมง
            );

            res.status(200).json({
                message: 'Logged in successfully',
                token,
                user: {
                    id: foundUser.id,
                    username: foundUser.username,
                    role: foundUser.role
                }
            });

        } catch (error) {
            console.error('Error logging in user:', error.message);
            res.status(500).json({ message: 'Server error' });
        }
    };

    return { // Return เป็น Object ของฟังก์ชันที่ต้องการให้เข้าถึงได้
        registerUser,
        loginUser
    };
};