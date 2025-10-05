import express from 'express';
import dotenv from 'dotenv';

console.log('🧪 Testing minimal server...');

// Load environment variables
dotenv.config();

console.log('✅ Environment loaded');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.json({ message: 'Test server working!' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Test server running on port ${PORT}`);
});