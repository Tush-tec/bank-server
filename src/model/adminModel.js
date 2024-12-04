import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminSchema = new Schema(

  {
    admin_name: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role : {
      type : Schema.Types.ObjectId,
      ref : "Role"
    }
  },
  {
    timestamps: true,
  }
);

// Middleware for hashing password before save
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Middleware For compare Password
adminSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.hash(password, this.passsword);
};

// Middleware for Generating Access Token
adminSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {

      _id: this._id,
      userName: this.userName,
      email: this.email,

    },
    
    process.env.ACCESS_TOKEN_SECRET_FOR_ADMIN,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY_FOR_ADMIN,
    }
  );
};

adminSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET_FOR_ADMIN,
    {
      expiresIn : REFRESH_TOKEN_EXPIRY_FOR_ADMIN
    }
  )
}

const Admin = mongoose.model("Admin", adminSchema);

export { Admin };
