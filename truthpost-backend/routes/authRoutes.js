const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User_Schema');
const router = express.Router();

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, 'cloudminiproject');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Middleware to check if user is super admin
const isSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || !user.isSuperAdmin) {
            return res.status(403).json({ error: 'Access denied. Super admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, phone } = req.body;
        
        if (!password || password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            phone,
            role: 'user' // Default role
        });
        
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error('Registration error:', err);
        // Send more detailed error message for debugging
        res.status(500).json({ 
            error: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password, isAdminLogin } = req.body;
        console.log('Login attempt:', { email, isAdminLogin }); // Debug log

        const user = await User.findOne({ email });
        console.log('User found:', user ? { 
            email: user.email, 
            role: user.role, 
            isSuperAdmin: user.isSuperAdmin 
        } : 'No user found'); // Debug log
        
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // If trying to access admin login but user is not an admin
        if (isAdminLogin && (user.role !== 'admin' && !user.isSuperAdmin)) {
            console.log('Admin login attempt by non-admin user'); // Debug log
            return res.status(403).json({ error: 'Access denied. Admin credentials required.' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch); // Debug log

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }
        
        const token = jwt.sign({ 
            userId: user._id,
            role: user.role,
            isSuperAdmin: user.isSuperAdmin
        }, 'cloudminiproject', { expiresIn: '1h' });

        console.log('Login successful:', { 
            userId: user._id,
            role: user.role,
            isSuperAdmin: user.isSuperAdmin
        }); // Debug log

        res.json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin
            }
        });
    } catch (error) {
        console.error('Login error:', error); // Debug log
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new admin (only super admin can do this)
router.post('/create-admin', verifyAdminToken, isSuperAdmin, async (req, res) => {
    try {
        const { name, email, password, isSuperAdmin } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isSuperAdmin: isSuperAdmin || false
        });

        await newAdmin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all admins (only super admin can do this)
router.get('/admins', verifyAdminToken, isSuperAdmin, async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;