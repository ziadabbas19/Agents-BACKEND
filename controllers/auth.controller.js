const asyncHandler  = require('express-async-handler');
const bycrypt = require ('bcryptjs');
const  jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {registerSchema, loginSchema} =  require('../validators/auth.validator')


//Generate JWT
const generateToken = (user)=>{
    return jwt.sign(
        {id:user._id, role:user.role},
        process.env.JWT_SECRET,
        {expiresIn:'30d'}
    );
};


//Register New User
exports.register = asyncHandler(async(req,res)=>{
    const {error} = registerSchema.validate(req.body);
    if(error){
        res.status(400);
        throw new Error(error.details[0].message)
    }

    const {name, email, password, role} = req.body;

    const exists = await User.findOne({email});
    if(exists){
        res.status(400);
        throw new Error('User already exists');
    }

    const hashed = await bycrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashed,
        role: role || 'user'
    });

    res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        token:generateToken(user)
    });
});



//LOGIN
exports.login = asyncHandler(async (req, res)=>{
    const {error} = loginSchema.validate(req.body);
    if(error){
        res.status(400);
        throw new Error(error.details[0].message)
    }

    const {email, password} = req.body;

    const user  = await User.findOne({email});
    if(!user || !(await bycrypt.compare(password, user.password))){
        res.status(401);
        throw new Error ('invalid email or password')
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user)
    });
});