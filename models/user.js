const { getDB } = require('../config/mongoConfig');

async function createUser(user) {
    try {
        const db = getDB();
        return await db.collection('users').insertOne(user);
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
}

async function getUserByEmail(email) {
    try {
        const db = getDB();
        return await db.collection('users').findOne({ email });
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}

module.exports = { createUser, getUserByEmail };