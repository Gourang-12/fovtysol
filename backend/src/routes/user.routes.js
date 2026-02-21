const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', upload.single('profilePicture'), updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
