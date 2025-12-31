
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/finauto_jobs";

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        // Check BaseUser
        const BaseUser = mongoose.connection.db.collection('baseusers');
        const baseUsers = await BaseUser.find({}).toArray();
        console.log(`\nBaseUsers count: ${baseUsers.length}`);
        baseUsers.forEach(u => {
            console.log(`- ${u.email} (${u.role}) [${u.constructor.name}]`);
        });

        // Check CleanUser (if exists)
        if (collections.find(c => c.name === 'cleanusers')) {
            const CleanUser = mongoose.connection.db.collection('cleanusers');
            const cleanUsers = await CleanUser.find({}).toArray();
            console.log(`\nCleanUsers count: ${cleanUsers.length}`);
            cleanUsers.forEach(u => {
                console.log(`- ${u.email} (${u.role})`);
            });
        }

        // Check Applicants (if exists separately)
        if (collections.find(c => c.name === 'applicants')) {
             const Applicants = mongoose.connection.db.collection('applicants');
             const applicants = await Applicants.find({}).toArray();
             console.log(`\nApplicants (collection) count: ${applicants.length}`);
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
