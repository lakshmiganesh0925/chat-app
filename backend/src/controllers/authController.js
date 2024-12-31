const { generateToken } = require('../lib/utils');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const cloudinary = require('../lib/cloudinary');


module.exports.signup = async(req,res)=>{
    const {fullName,email,password} =req.body;
    try {
        if(!fullName|| !email|| !password){
            return res.status(400).json({
                message:"All fields are required"
        });
    }
        //hashpassword
    
        if(password.length<6){
            return res.status(400).json({
                message:"Password must be at least 6 characters"
            });
        }

        const user  = await User.findOne({email})
        if(user) return res.status(400).json({message:"Email already exists"});
         
        const salt  = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)

        const newUser =new User({
            fullName:fullName,
            email:email,
            password:hashPassword
        })

        if(newUser){
            //generate jwt token here
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic,
            });

        }else{
             res.status(400).json({message:"Invalid User data"});
        }

    } catch (error) {
        console.log("Error in signup Controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

module.exports.login = async(req,res) =>{
    const {email,password} =req.body;
    try {
        const  user = await User.findOne({email})

        if(!user){
            return res.status(400).json({message:"Invalid User"})
        }
      const isPasswordCorrect = await bcrypt.compare(password,user.password)
      if(!isPasswordCorrect){
        return res.status(400).json({message:"Invalid Password"});
      }

      generateToken(user._id,res)

      res.status(200).json({
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        profilePic:user.profilePic,
      })


    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

module.exports.logout = async(req,res) =>{
    try{
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"});
    }
    catch(error){
        console.log("Error in logout controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

module.exports.updateProfile=async(req,res)=>{
    try {
        const {profilePic} =req.body;
        const userId=req.user._id
        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required"});
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updateUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true})

        res.status(200).json(updateUser);
    } catch (error) {
        console.log("error in update profile:", error)
        re.status(500).json({message:"Internal server error"}); 
    }
}

module.exports.checkAuth = (req,res)=>{
    try{
      res.status(200).json(req.user._id);
    }
    catch(error){
      console.log("Error in checkAuth controller",error.message);
      res.status(500).json({message:"Internal Server Error"});
    }
}