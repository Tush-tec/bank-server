  import mongoose, { Schema } from "mongoose";

  const acSchema = new Schema(
    {
      account_Holder: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      account_Number: {
        type: Number,
        required: true,
      },
      account_Type: {
        type: String,
        enum: ["Saving", "Checking", "Business"],
        required: true,
      },
      balance: {
        type: Number,
        required: true,
        default: 0,
        min: [0, "Balance cannot be negative"],
      },
    },
    {
      timestamps: true,
    }
  );

  const Account = mongoose.model("Account", acSchema);

  export { Account };
