import User from "../models/User.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        const existUser = await User.findOne({email});
        if(existUser){
            return res.status(401).json({ message: "Email already exists!"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            {id: newUser._id},
            process.env.JWT_SECRET,
            {expiresIn: "7D"}
        );

        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            token: token
        });
    } catch (error) {
        res.status(500).json({message: "Server error!", error: error});
    }
};

export const login = async (req, res) => {
    try {
        const {email , password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({message: "Invalid Credentials!"});;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({message: "Invalid Credentials!"});;
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7D" }
        );

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: token
        });
    } catch (error) {
        res.status(500).json({message: "Server error!", error: error});
    }
};