const express=require('express');
const router=express.Router();
const userController=require('../controllers/userController');


router.post('/register',userController.register);

router.post('/login',userController.login);

// Add the route for getting all registered users 
router.get('/users', userController.getAllUsers);

// Add the route for getting user by ID
router.get('/users/:id', userController.getUserById);


module.exports= router;