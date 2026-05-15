import UserModel from "../models/Auth.js"
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import ConversationModel from "../models/Converstion.js"
export const Register=async(req,res)=>{
     try {
        const {name,email,password}=req.body
          if (!name || !email || !password || !req.file) {
            return res.status(400).json({success:false,message:`${
                
                !name ? "Name" : !email ? "Email" : !password ? "Password" : !req.file ? 'Profile is required':""} is Required` })
          }
          console.log('req.file',req.file)
          
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser=await UserModel.findOne({email: normalizedEmail})
        
        console.log(`Checking registration for: ${normalizedEmail}. Found: ${existingUser ? 'YES' : 'NO'}`);
        
        if(existingUser){
            return res.status(400).json({success:false,message:"User already exists"})
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
       
        const imagePath = `${baseUrl}/images/${req.file.filename}`;
        const hashedPassword=await bcryptjs.hash(password,10)
        const newUser=new UserModel({
            name,
            email: normalizedEmail,
            password:hashedPassword,
            profile:imagePath
        })
        await newUser.save()
        res.status(200).json({success:true,message:"User registered successfully",user:newUser})
     } catch (error) {
        res.status(500).json({success:false,message:error.message})
     }
}


export const Login=async(req, res)=>{
    try {
        const {email, password}=req.body
        if(!email || !password){
            return res.status(400).json({success:false, message:"Email and password are required"})
        }
        const user=await UserModel.findOne({email: email.toLowerCase().trim()})
        if(!user){
            return res.status(400).json({success:false, message:"User does not exist please register"})
        }
        const isMatch=await bcryptjs.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({success:false, message:"Invalid credentials"})
        }
        const token=jwt.sign({id:user._id}, process.env.JWT_SECRET, {expiresIn:"1d"})
        res.status(200).json({success:true, message:"User logged in successfully", user,token})
    } catch (error) {
        res.status(500).json({success:false, message:error.message})
    }
}

 export const GetUser=async(req, res)=>{
    try {
        const user=await UserModel.find()
        res.status(200).json({success:true, message:"User fetched successfully", user})
    } catch (error) {
        res.status(500).json({success:false, message:error.message})
    }
}

export const SearchUserByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: "Email is required" });
        
        // Trim and lowercase to match the normalized data in the DB
        const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const BlockUser = async (req, res) => {
    try {
        const { userId, emailToBlock } = req.body;
        const targetUser = await UserModel.findOne({ email: emailToBlock.toLowerCase().trim() });
        
        if (!targetUser) return res.status(404).json({ success: false, message: "User not found" });
        if (targetUser._id.toString() === userId) return res.status(400).json({ success: false, message: "You cannot block yourself" });

        // Add to blockList
        await UserModel.findByIdAndUpdate(userId, { 
            $addToSet: { blockList: targetUser._id } 
        });

        // Automatically remove conversation if it exists
        await ConversationModel.findOneAndDelete({
            members: { $all: [userId, targetUser._id.toString()] }
        });

        res.status(200).json({ success: true, message: "User blocked and chat removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};