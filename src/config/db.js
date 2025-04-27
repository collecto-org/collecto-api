import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logDetailedError } from '../utils/logger.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        console.log('Intentando conectar a MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Conexión a MongoDB establecida');
    } catch (error) {
        logDetailedError(error, null, 'connectDB');
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;

console.log('Intentando conectar a MongoDB...');
