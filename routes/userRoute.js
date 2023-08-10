const express=require('express');
const router=express.Router();
const multer = require('multer');
const path = require('path');
const userController=require('../controllers/userController');
const checkAuth = require('../middleware/check_auth');




//! Use of Multer
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './assets/images/');     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })
  
  var upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });



router.post('/register',userController.register);

router.post('/login',userController.login);

// Add the route for getting all registered users 
router.get('/users', checkAuth, userController.getAllUsers);

// Add the route for getting user by ID
router.get('/users/:id', checkAuth, userController.getUserById);

router.patch('/users/:id', upload.single('userimage'), userController.updateUser);

// router.post('forget-password', userController.forgetPassword);


module.exports= router;