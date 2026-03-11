import mongoose from "mongoose";
import bycrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true
		},
		email: {
			type: String,
			unique: true,
			required: true,
			trim: true
		},
		password: {
			type: String,
			required: true,
			trim: true
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		refreshAccessToken: {
			type: String,
		},
		refreshAccessExpiry: {
			type: Date,
		},
		forgotPasswordToken: {
			type: String,
		},
		forgotPasswordExpiry: {
			type: Date,
		},
		emailVerificationToken: {
			type: String,
		},
		emailVerificationExpiry: {
			type: Date,
		}
	}, {timestamps: true}
);

userSchema.pre("save", async function(){
	if(this.isModified("password")){
		this.password = await bycrypt.hash(this.password, 10);
	}
});

userSchema.methods.generateAccessToken = () => {
	return jwt.sign(
		{
			id: this._id,
			name: this.name,
			email: this.email
		},
		process.env.ACCESS_TOKEN_SECRET,
		{expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
	);
}

userSchema.methods.generateRefreshToken = () => {
	return jwt.sign(
		{
			id: this._id
		},
		process.env.REFRESH_TOKEN_SECRET,
		{expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
	);
}

userSchema.methods.generateTemporaryToken = () => {
	const unhashedToken = crypto.randomBytes(20).toString("hex");

	const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");
	
	const tokenExpiry = Date.now() + (20*60*1000); // 20mins
	return {unhashedToken, hashedToken, tokenExpiry};
}

export default mongoose.model("User", userSchema);
