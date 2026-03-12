import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { APIResponse } from "../utils/api-response.js";

export const register = asyncHandler(async (req, res) =>{
		const { name, email, password } = req.body;

		const existUser = await User.findOne({ email });
		console.log(existUser);
		if (existUser) {
			return res.status(401).json({ message: "Email already exists!" });
		}

		console.log(`Creating account ...`);
		const newUser = await User.create({
			name,
			email,
			password,
		});

		console.log(newUser);
		const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});


		res.status(201).json(
			new APIResponse(
				201,
				{
					_id: newUser._id,
					name: newUser.name,
					email: newUser.email,
					token: token,
				},
			)
		);
	} 
);

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: "Invalid Credentials!" });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: "Invalid Credentials!" });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "1d",
		});

		
		res.json(
			new APIResponse(
				201,
				{
					_id: user._id,
					name: user.name,
					email: user.email,
					token: token,
				},
			)
		);
	} catch (error) {
		res.status(500).json({ message: "Server error!", error: error });
	}
};
