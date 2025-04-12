const mongoose = require('mongoose');
const User = require('../models/User_Schema');
const bcrypt = require('bcrypt');
require('dotenv').config();

console.log('Environment variables:', {
    MONGO_URI: process.env.MONGO_URI,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD ? 'Password is set' : 'Password is not set'
});

const createSuperAdmin = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env file');
        }
        if (!process.env.SUPER_ADMIN_EMAIL) {
            throw new Error('SUPER_ADMIN_EMAIL is not defined in .env file');
        }
        if (!process.env.SUPER_ADMIN_PASSWORD) {
            throw new Error('SUPER_ADMIN_PASSWORD is not defined in .env file');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully');

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ isSuperAdmin: true });
        if (existingSuperAdmin) {
            console.log('Super admin already exists:', existingSuperAdmin.email);
            process.exit(0);
        }

        // Hash the password
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

        // Create super admin
        console.log('Creating super admin...');
        const superAdmin = new User({
            name: 'Super Admin',
            email: process.env.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            role: 'admin',
            isSuperAdmin: true
        });

        await superAdmin.save();
        console.log('Super admin created successfully:', superAdmin.email);
        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
};

createSuperAdmin(); 