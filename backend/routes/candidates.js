import express from 'express';
import path from 'path';
import fs from 'fs';
import { BaseUser } from '../models/UserModels.js';

const router = express.Router();

// GET /api/candidates
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Candidates endpoint', data: [] });
});

// GET /api/candidates/:candidateId/resume - Download resume by candidate ID
router.get('/:candidateId/resume', async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    // Get candidate info to find username
    const candidate = await BaseUser.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
    
    const username = candidate.username;
    const projectRoot = path.join(process.cwd(), '..');
    
    // Try different possible resume file extensions and locations
    const possiblePaths = [
      path.join(projectRoot, 'uploads', 'documents', `resume_${username}.pdf`),
      path.join(projectRoot, 'uploads', 'documents', `resume_${username}.doc`),
      path.join(projectRoot, 'uploads', 'documents', `resume_${username}.docx`),
      path.join(projectRoot, 'uploads', 'applications', `resume_${username}.pdf`),
      path.join(projectRoot, 'uploads', 'applications', `resume_${username}.doc`),
      path.join(projectRoot, 'uploads', 'applications', `resume_${username}.docx`),
      // Fallback to old format if new format doesn't exist
      path.join(projectRoot, 'uploads', 'documents', `resume-${candidateId}-*.pdf`),
      path.join(projectRoot, 'uploads', 'applications', `resume-${candidateId}-*.pdf`)
    ];
    
    let resumePath = null;
    let filename = `resume_${username}.pdf`;
    
    // Check each possible path
    for (const filePath of possiblePaths) {
      if (filePath.includes('*')) {
        // Handle wildcard patterns for old format
        const dir = path.dirname(filePath);
        const pattern = path.basename(filePath);
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const matchingFile = files.find(file => 
            file.startsWith(pattern.replace('*', '').replace('.pdf', '')) && 
            file.endsWith('.pdf')
          );
          if (matchingFile) {
            resumePath = path.join(dir, matchingFile);
            filename = matchingFile;
            break;
          }
        }
      } else if (fs.existsSync(filePath)) {
        resumePath = filePath;
        filename = path.basename(filePath);
        break;
      }
    }
    
    if (!resumePath) {
      return res.status(404).json({
        success: false,
        message: `Resume not found for candidate ${candidate.fullName || candidate.username}`,
        searchedPaths: possiblePaths.filter(p => !p.includes('*'))
      });
    }
    
    // Set appropriate headers for file download
    const ext = path.extname(resumePath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(resumePath);
    fileStream.pipe(res);
    
    console.log(`✅ Resume downloaded: ${filename} for candidate ${candidate.fullName || candidate.username}`);
    
  } catch (error) {
    console.error('❌ Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resume',
      error: error.message
    });
  }
});

export default router;
