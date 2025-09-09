const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv|xlsx|json/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// In-memory storage for artifact metadata (use database in production)
let artifacts = [];

// Upload artifact
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const artifact = {
      id: uuidv4(),
      filename: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      metadata: {
        description: req.body.description || '',
        tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
        category: req.body.category || 'general'
      }
    };

    artifacts.push(artifact);

    // Emit artifact upload event
    const io = req.app.get('io');
    io.emit('artifact-uploaded', {
      id: artifact.id,
      filename: artifact.filename,
      size: artifact.size
    });

    logger.info(`Artifact uploaded: ${artifact.filename} (${artifact.size} bytes)`);

    res.status(201).json({
      success: true,
      artifact: {
        id: artifact.id,
        filename: artifact.filename,
        mimetype: artifact.mimetype,
        size: artifact.size,
        uploadedAt: artifact.uploadedAt,
        metadata: artifact.metadata
      }
    });
  } catch (error) {
    logger.error('Artifact upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
});

// Get all artifacts
router.get('/', (req, res) => {
  const { category, tags } = req.query;
  
  let filteredArtifacts = artifacts;

  if (category) {
    filteredArtifacts = filteredArtifacts.filter(
      artifact => artifact.metadata.category === category
    );
  }

  if (tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    filteredArtifacts = filteredArtifacts.filter(
      artifact => tagArray.some(tag => artifact.metadata.tags.includes(tag))
    );
  }

  res.json({
    success: true,
    artifacts: filteredArtifacts.map(artifact => ({
      id: artifact.id,
      filename: artifact.filename,
      mimetype: artifact.mimetype,
      size: artifact.size,
      uploadedAt: artifact.uploadedAt,
      metadata: artifact.metadata
    }))
  });
});

// Download artifact
router.get('/:id/download', (req, res) => {
  try {
    const { id } = req.params;
    const artifact = artifacts.find(a => a.id === id);

    if (!artifact) {
      return res.status(404).json({
        success: false,
        error: 'Artifact not found'
      });
    }

    if (!fs.existsSync(artifact.path)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on disk'
      });
    }

    res.download(artifact.path, artifact.filename);
  } catch (error) {
    logger.error('Artifact download error:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed'
    });
  }
});

// Get artifact metadata
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const artifact = artifacts.find(a => a.id === id);

  if (!artifact) {
    return res.status(404).json({
      success: false,
      error: 'Artifact not found'
    });
  }

  res.json({
    success: true,
    artifact: {
      id: artifact.id,
      filename: artifact.filename,
      mimetype: artifact.mimetype,
      size: artifact.size,
      uploadedAt: artifact.uploadedAt,
      metadata: artifact.metadata
    }
  });
});

// Update artifact metadata
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { description, tags, category } = req.body;

    const artifactIndex = artifacts.findIndex(a => a.id === id);
    if (artifactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artifact not found'
      });
    }

    if (description !== undefined) {
      artifacts[artifactIndex].metadata.description = description;
    }
    if (tags !== undefined) {
      artifacts[artifactIndex].metadata.tags = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    }
    if (category !== undefined) {
      artifacts[artifactIndex].metadata.category = category;
    }

    res.json({
      success: true,
      artifact: {
        id: artifacts[artifactIndex].id,
        filename: artifacts[artifactIndex].filename,
        mimetype: artifacts[artifactIndex].mimetype,
        size: artifacts[artifactIndex].size,
        uploadedAt: artifacts[artifactIndex].uploadedAt,
        metadata: artifacts[artifactIndex].metadata
      }
    });
  } catch (error) {
    logger.error('Artifact update error:', error);
    res.status(500).json({
      success: false,
      error: 'Update failed'
    });
  }
});

// Delete artifact
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const artifactIndex = artifacts.findIndex(a => a.id === id);

    if (artifactIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Artifact not found'
      });
    }

    const artifact = artifacts[artifactIndex];

    // Delete file from disk
    if (fs.existsSync(artifact.path)) {
      fs.unlinkSync(artifact.path);
    }

    // Remove from array
    artifacts.splice(artifactIndex, 1);

    // Emit artifact deletion event
    const io = req.app.get('io');
    io.emit('artifact-deleted', { id });

    res.json({
      success: true,
      message: 'Artifact deleted successfully'
    });
  } catch (error) {
    logger.error('Artifact deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Deletion failed'
    });
  }
});

// Get artifact statistics
router.get('/stats/overview', (req, res) => {
  const stats = {
    total: artifacts.length,
    totalSize: artifacts.reduce((sum, artifact) => sum + artifact.size, 0),
    categories: {},
    mimetypes: {}
  };

  artifacts.forEach(artifact => {
    // Count by category
    const category = artifact.metadata.category;
    stats.categories[category] = (stats.categories[category] || 0) + 1;

    // Count by mimetype
    const mimetype = artifact.mimetype;
    stats.mimetypes[mimetype] = (stats.mimetypes[mimetype] || 0) + 1;
  });

  res.json({
    success: true,
    stats
  });
});

module.exports = router;