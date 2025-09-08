import xss from 'xss';
import validator from 'validator';

/**
 * Sanitize a single value
 */
const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        // Remove any script tags and dangerous HTML
        value = xss(value, {
            whiteList: {}, // No tags allowed
            stripIgnoreTag: true,
            stripIgnoreTagBody: ['script', 'style']
        });
        
        // Normalize string
        value = validator.trim(value);
        value = validator.stripLow(value);
        value = validator.normalizeEmail(value);
        
        return value;
    }
    
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
    }
    
    if (typeof value === 'object' && value !== null) {
        const sanitizedObj = {};
        for (const key in value) {
            sanitizedObj[key] = sanitizeValue(value[key]);
        }
        return sanitizedObj;
    }
    
    return value;
};

/**
 * Deep sanitize request body, query params, and URL params
 */
export const sanitizeRequest = (req, res, next) => {
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    
    if (req.query) {
        req.query = sanitizeValue(req.query);
    }
    
    if (req.params) {
        req.params = sanitizeValue(req.params);
    }
    
    next();
};

/**
 * Escape HTML entities to prevent XSS
 */
export const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * SQL Injection prevention
 */
export const preventSqlInjection = (value) => {
    if (typeof value !== 'string') return value;
    
    const sqlKeywords = [
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP',
        'UNION', 'JOIN', 'WHERE', 'HAVING', 'GROUP BY'
    ];
    
    let sanitized = value;
    
    // Remove SQL comments
    sanitized = sanitized.replace(/--/g, '');
    sanitized = sanitized.replace(/\/\*/g, '');
    sanitized = sanitized.replace(/\*\//g, '');
    
    // Remove semicolons
    sanitized = sanitized.replace(/;/g, '');
    
    // Escape quotes
    sanitized = sanitized.replace(/['"`]/g, '\\$&');
    
    // Remove SQL keywords
    sqlKeywords.forEach(keyword => {
        const regex = new RegExp('\\b' + keyword + '\\b', 'gi');
        sanitized = sanitized.replace(regex, '');
    });
    
    return sanitized;
};

/**
 * SQL Injection prevention middleware
 */
export const sqlInjectionPrevention = (req, res, next) => {
    const sanitizeSqlInput = (obj) => {
        for (let prop in obj) {
            if (obj[prop]) {
                if (typeof obj[prop] === 'string') {
                    obj[prop] = preventSqlInjection(obj[prop]);
                } else if (typeof obj[prop] === 'object') {
                    sanitizeSqlInput(obj[prop]);
                }
            }
        }
    };
    
    if (req.body) sanitizeSqlInput(req.body);
    if (req.query) sanitizeSqlInput(req.query);
    if (req.params) sanitizeSqlInput(req.params);
    
    next();
};

/**
 * File upload sanitization
 */
export const sanitizeFileUpload = (filename) => {
    // Remove any directory traversal attempts
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    return sanitized;
};

/**
 * URL sanitization
 */
export const sanitizeUrl = (url) => {
    if (typeof url !== 'string') return url;
    return validator.isURL(url) ? url : '';
};

/**
 * Email sanitization
 */
export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return email;
    return validator.normalizeEmail(email);
};

/**
 * Phone number sanitization
 */
export const sanitizePhone = (phone) => {
    if (typeof phone !== 'string') return phone;
    return phone.replace(/[^\d+]/g, '');
};

/**
 * Middleware to prevent NoSQL injection
 */
export const preventNoSqlInjection = (req, res, next) => {
    const sanitizeData = (obj) => {
        for (let key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                sanitizeData(obj[key]);
            } else if (obj[key] && typeof obj[key] === 'string') {
                // Remove MongoDB operators
                if (key[0] === '$') {
                    delete obj[key];
                }
            }
        }
        return obj;
    };
    
    if (req.body) req.body = sanitizeData(req.body);
    if (req.query) req.query = sanitizeData(req.query);
    if (req.params) req.params = sanitizeData(req.params);
    
    next();
};
