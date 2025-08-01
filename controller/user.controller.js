const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const transactionHistoryModel = require("../models/transactionHistory.model.js");

let message;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET, 
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.send({
      status: 401,
      message: "unauthorized token",
    });
  }

  jwt.verify(token, process.env.APP_PASS, (err, user) => {
    if (err) {
      return res.send({
        status: 403,
        message: " token is invalid",
      });
    }
    req.user = user;
    next();
  });
};

const signupPage = async (req, res) => {
  console.log("working");
  const { firstName, lastName, email, phoneNumber, password, profileImage } =
    req.body;
  let image;
  console.log("working");
  try {
    const saltRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, saltRound);

    console.log("working..");

    await cloudinary.v2.uploader.upload(profileImage, async (error, result) => {
      if (error) {
        console.log("cannot upload file at the moment");
      } else {
        console.log("file uploaded successfully");
        console.log(result.secure_url);
        image = result.secure_url;
      }
    });
    console.log(image);
    console.log(hashedPassword);
    console.log(req.body);

    let user = userModel({
      firstName,
      lastName,
      email,
      phoneNumber,
      profileImage: image,
      password: hashedPassword,
    });
    await user.save();
    res.send({ status: true, message: "account created successfully" });

  } catch (err) {
    console.log(err);

    if (err.errorResponse.code == 11000) {
      res.send({
        status: false,
        message: "cannot create account, user exists",
      });
    } else {
      res.send({
        status: false,
        message: "cannot create account, invalid credentials",
      });
    }
  }
};

const loginPage = async (req, res) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    res.send({ status: false, message: "invalid credentials" });
  } else {
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.APP_PASS, {
        expiresIn: "1h",
      });
      res.send({
        status: true,
        message: "sign in successful",
        token,
        id: user._id,
      });
    } else {
      console.log("invalid credentials");
      res.json({ status: false, message: "invalid credentials" });
    }
  }
};

const forgotPass = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await userModel.findOne({ email });
    if (user) {
      console.log(user);
      const saltRound = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, saltRound);
      const updatedUser = await userModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
      });
      if (updatedUser) {
        res.send({ status: true, message: "account updated successfully" });
      }
    }
  } catch (error) {
    res.send({ status: false, message: "cannot update account" });
  }
};

const DashboardData = async (req, res) => {
  const { id } = req.params;
  const user = await userModel.findById(id);
  console.log(user);
  if (!user) return res.status(404).send("User not found");

  console.log('dashhhhhh')

  res.send({
    dateCreated: user.dateCreated,
    name: user.firstName + " " + user.lastName,
    email: user.email,
    balance: user.accountBalance,
    profile: user.profileImage,
    accountnum: user.accountNumber,
  });
};

const resolveAccount = async (req, res) => {
  const { accountNumber } = req.body;
  try {
    let user = await userModel.findOne({ accountNumber });
    if (!user) {
      res.send({status: false, data: "cannot resolve account"  });
    } else {
      res.send({
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
      });
      console.log(user);
    }
  } catch (error) {
    console.log(error);
  }
};
const transferFunds = async (req, res) => {
  const { amount, receipientAc, description } = req.body;
  const { id } = req.params;
  let user = await userModel.findById(id);
  try {
    if (user) {
      console.log(user);
      }
      if(receipientAc === user.accountNumber){
          res.send({status: false, message: 'cannot transfer to yourself'})
        }

      if (amount > user.accountBalance) {
        res.send({ status: false, message: "insufficient funds" });
        if(!user){
          res.send({status: false, message: ' cannot transfer funds to a non existing user!'})
        }
      } else {
        let updatedBalance = Number(user.accountBalance) - Number(amount);
        res.send({ status: true, message: "Funds transferred successfully" });
        console.log(user.accountBalance);

        let newUser = await userModel.findByIdAndUpdate(user._id, {
          accountBalance: updatedBalance,
        });
        let receipient = await userModel.findOne({
          accountNumber: receipientAc,
        });
        console.log(receipient);
        let receipientUpdatedBalance =
          Number(amount) + Number(receipient.accountBalance);
        let newReceipient = await userModel.findByIdAndUpdate(receipient._id, {
          accountBalance: receipientUpdatedBalance,
        });
        await transactionHistoryModel.create({
          userId: user._id,
          transactionType: "transfer",
          amount: amount,
          accountNumber: receipientAc,
          receipient: receipient._id,
          balance_before: user.accountBalance,
          balance_after : updatedBalance,
          description: description || 'sent from EsaveMFB',
        });
        await transactionHistoryModel.create({
          userId: receipient._id,
         transactionType: 'received',
          amount: amount,
          accountNumber: user.accountNumber,
          receipient: user._id,
          balance_before: receipient.accountBalance,
          balance_after : receipientUpdatedBalance,
          description: description || 'received from EsaveMFB' 
        }) 
        console.log(newReceipient);

        console.log(newUser);
      }
    }catch(error){
      res.send({ status: false, message: "error sending amount " });
      console.log(error);
    }
    }
const depositFunds = async (req, res) => {
  const { amount, accountNumber } = req.body;
  const { id } = req.params;
  let user = await userModel.findById(id);
  try {
    if (user.isAdmin) {
      if (amount < 1 || !user.isAdmin) {
        res.send({ status: false, message: "cannot deposit" });
      } else {
        let customer = await userModel.findOne({ accountNumber });
        if (customer) {
          let updatedBalance = Number(amount) + Number(customer.accountBalance);
          res.send({status: true, message: 'funds deposited successfully'})
          console.log(updatedBalance);
          let newUser = await userModel.findByIdAndUpdate(customer._id, {
            accountBalance: updatedBalance,
          });
          res.send({ status: true, message: "funds deposited successfully" });
          console.log(newUser);
        }
      }
    }
  } catch (error) {
    res.send({ status: false, message: "cannot deposit at this moment" });
    console.log(error);
  }
};

const getTransactionHistory=async(req, res)=>{
  const {id} = req.params
  const transactions = await transactionHistoryModel.find({userId:id})
  console.log(transactions);
  try {
    if( transactions){
      res.send({status: true, data: transactions})
    }else{
      res.send({status: false, message: 'no transaction found'})
    }
    
  } catch (error) {
    console.log(error);
    
  }
}

module.exports = {
  signupPage,
  loginPage,
  forgotPass,
  DashboardData,
  authenticateToken,
  checkk,
  resolveAccount,
  transferFunds,
  depositFunds,
  getTransactionHistory,
};
