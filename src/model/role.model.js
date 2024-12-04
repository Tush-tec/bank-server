import mongoose, { Schema } from "mongoose";
import { Admin } from "./adminModel";

const roleSchema = new Schema(
  {
    role: {
      type: String,
      required : true,
      uniquec : true
    },
    permission :[String]
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", roleSchema)

export {Role}
