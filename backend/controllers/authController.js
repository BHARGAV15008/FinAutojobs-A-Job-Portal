import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { BaseUser } from '../models/UserModels.js';
import { sendEmail } from '../services/emailService.js';
import { generateOTP, verifyOTP } from '../utils/otpUtils.js';
import { createUserProfile } from '../services/profileService.js';
import { logActivity } from '../services/activityLogger.js';
import { NotificationService } from '../services/notifications.js';

export default {
};
