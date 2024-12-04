import mongoose, {isValidObjectId} from "mongoose";
import { Credit } from "../model/creditCard.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCreditCard = asyncHandler(async (req, res) => {
  const { user, credit_limit, expiration_date, interest_rate } = req.body;

  if (!user || !expiration_date) {
    throw new ApiError(400, "User and expiration date are required");
  }

  const creditCard = await Credit.create({
    user,
    credit_limit: credit_limit || 0,
    outStanding_balance: 0,
    interest_rate: interest_rate || 0,
    expiration_date,
  });

  if (!creditCard) {
    throw new ApiError(400, "credit card making failed!");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, creditCard, "Your credit card make successfull!")
    );
});

const updateCreditCard = asyncHandler(async (req, res) => {

  const { cardNumber } = req.params;
  const { credit_limit, status } = req.body;

  if(!isValidObjectId(cardNumber)){
    throw new ApiError(400, "card number not available for updation of credit card " || "card number is not validObjectId")
  }

  const creditCardUpdation = await Credit.findOneAndUpdate(
    {
      cardNumber,
    },
    {
      $set: {
        credit_limit,
        status,
      },
    },
    {
      new: true,
    }
  );

  if (!creditCardUpdation) {
    throw new ApiError(404, "Credit card not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, creditCardUpdation, "Credit card Update successfull")
    );
});

const deactivateCreditCard = asyncHandler(async (req, res) => {
  const { cardNumber } = req.params;

  if(!isValidObjectId(cardNumber)){
    throw new ApiError(400, "card number not found while process deactive request")
  }

  const creditCardDeactivation = await Credit.findOneAndUpdate(
    {
      cardNumber,
    },
    {
      $set: {
        status: "Inactive",
      },
    },
    {
      new: true,
    }
  );

  if (!creditCardDeactivation) {
    throw new ApiError(404, "Credit card not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        creditCardDeactivation,
        "Credit card deactivation successfull"
      )
    );
});

const chargeCreditCard = asyncHandler(async (req, res) => {
  const { cardNumber, amount } = req.body;

  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  const creditCard = await Credit.findOne({ cardNumber });

  if (!creditCard) {
    throw new ApiError(404, "Credit card not found");
  }

  if (creditCard.outStanding_balance + amount > creditCard.credit_limit) {
    throw new ApiError(400, "Insufficient credit limit");
  }

  creditCard.outStanding_balance += amount;
  await creditCard.save();

  return res.status(200).json(200, creditCard, "Charge Applied Successfully");
});

const makePayment = asyncHandler(async (req, res) => {

  const { cardNumber, amount } = req.body;

  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than zero");
  }

  const creditCard = await Credit.findOne({ cardNumber });

  if (!creditCard) {
    throw new ApiError(404, "Credit card not found");
  }

  if (creditCard.outStanding_balance < amount) {
    throw new ApiError(400, "Payment exceeds outstanding balance");
  }

  const updatedCreditCard = await Credit.findOneAndUpdate(
    {
      cardNumber,
    },
    {
      $inc: { outStanding_balance: -amount },
    },
    {
      new: true,
    }
  );

  if(!updatedCreditCard){
    throw ApiError(400, "updation failed")
  }
  return res
  .status(200)
  .json(
    new ApiResponse(
        200,
        updatedCreditCard,
        "payment made successfully"
    )
  )
})

const getAllCreditCardsForUser = asyncHandler(async (req, res) => {

    const { userId } = req.params;
     
    if(!isValidObjectId(userId)){
        throw new ApiError(404, "user not found")
    }
     
    const creditCards = await Credit.find({ user: userId });

  
    if (!creditCards || creditCards.length === 0) {
      throw new ApiError(404, "No credit cards found for this user");
    }
  
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            creditCards,
            "Cards are fetched"
        )
    );
  });
  

export {
    createCreditCard,
    updateCreditCard,
    chargeCreditCard,
    deactivateCreditCard,
    makePayment,
    getAllCreditCardsForUser
}
