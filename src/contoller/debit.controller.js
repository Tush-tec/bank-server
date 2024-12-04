import { Debit } from "../model/debitCard.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const generateValidCardNumber = () => {
  let cardNumber = "";

  do {
    cardNumber = "";
    while (cardNumber.length < 16) {
      cardNumber += Math.floor(Math.random() * 10);
    }
  } while (!validateLuhn(cardNumber));

  return cardNumber;
};

const validateLuhn = (cardNumber) => {
  let sum = 0;
  let alternate = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let n = parseInt(cardNumber[i], 10);

    if (alternate) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }

    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
};

const createDebitCard = asyncHandler(async (req, res) => {
  const { user, balance, status, expirationDate } = req.body;

  if (!user || balance == null || !status || !expirationDate) {
    throw new ApiError(400, "Invalid request, missing required fields");
  }

  const existCard = await Debit.findOne({ user });
  if (existCard) {
    throw new ApiError(409, "Debit card already exists for this user");
  }

  const cardNumber = generateValidCardNumber();

  const createCard = await Debit.create({
    card_Number: cardNumber,
    user,
    balance,
    status,
    expirationDate,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createCard,
        "Your Debit card was created successfully!"
      )
    );
});

const withdrawFromDebitCard = asyncHandler(async (req, res) => {
  const { user, amount, cardNumber } = req.body;

  const debitCard = await Debit.findOne({
    card_number: cardNumber,
    user: user,
  });
  if (!debitCard) {
    return res.status(404).json({ message: "Debit card not found" });
  }

  if (debitCard.balance < amount) {
    return res.status(400).json({ message: "Insufficient funds" });
  }

  const updateDebitDetails = await Debit.find(
    {
      _id: Debit._id,
    },
    {
      $inc: { balance: -amount },
    }
  );

  if (!updateDebitDetails) {
    throw ApiError(
      400,
      "something went wrong, please check your updateDebitDetails function!"
    );
  }

  const createNewTransaction = await Debit.insertOne({
    user,
    amount,
    status: "Success!",
  });
});

const depositDebitCard = asyncHandler(async (req, res) => {
  const { user, amount } = req.body;

  const debitCard = await Debit.findOne({ user: userId });
  if (!debitCard) {
    throw new ApiError(404, "Debit card not found");
  }

  const updateDepositDetails = await Debit.findOneAndUpdate(
    {
      _id: Debit._id,
    },
    {
      $inc: { balance: +amount },
    }
  );

  if (!updateDepositDetails) {
    throw ApiError(
      400,
      "something went wrong, please check your updateDepositDetails function!"
    );
  }

  const transaction = await Debit.insertOne({
    user,
    amount,
    card_type: "Debit",
    status: "Success",
  });

  if (!transaction) {
    throw ApiError(403, "deposit failed!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, transaction, "Deposit Successfull!"));
});

const deleteDebitCards = asyncHandler(async (req, res) => {
  const { userId, cardNumber } = req.params;

  if(!userId || !cardNumber){
    throw new ApiError(404,"invalid request, request comes from params are failed!")
  }
  const deleteDebitCard = await Debit.findOneAndUpdate(
    {
      user: userId,
      card_Number: cardNumber,
      status: {
        $ne: "Inactive",
      },
    },
    {
      $set: {
        status: "Inactive",
      }
    },
    {
      new: true,
    }
  )

  if (!deleteDebitCard) {
    throw new ApiError(404, "Debit card not found or already inactive");
  }

  return res
  .status(200)
  .json(
    new ApiError(
        200, 
        deleteDebitCard,
        "Your card is inactive!"
    )
  )

})

export { 
    createDebitCard, 
    withdrawFromDebitCard, 
    depositDebitCard, 
    deleteDebitCards
};
