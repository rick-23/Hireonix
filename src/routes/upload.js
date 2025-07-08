const express = require('express');
const upload = require('../middlewares/upload'); // Make sure you have this middleware set up

const router = express.Router();

router.post('/upload-resume', upload.single('resume'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }
    res.status(200).json({
        message: 'Resume uploaded successfully',
        filePath: req.file.path,
        fileName: req.file.originalname
    });
});

module.exports = router;