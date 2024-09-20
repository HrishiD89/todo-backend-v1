import express from "express";
import { UserModel, TodoModel } from "./db.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { auth, JWT_SECRET } from "./auth.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import 'dotenv/config'

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
mongoose.connect(
  process.env.MONGO_STRING
);

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.redirect("/login");
})

app.get("/login", (req, res) => {
    res.sendFile("./public/login.html", { root: __dirname });
});

app.get("/signup", (req, res) => {
    res.sendFile("./public/signup.html", { root: __dirname });
});


// Zod schemas
const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

app.post("/signup", async (req, res) => {
  try {
    // check if the password has 1 lowercase character, 1 uppercase character, 1 number and 1 special character
    const { name, email, password } = signupSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      email,
      password: hashedPassword,
      name,
    });

    res.json({
      message: "You are signed up",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    } else {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(403).json({
        message: "Incorrect credentials",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        JWT_SECRET
      );

      res.json({
        token,
        message:"Logged in successfully"
      });
    } else {
      res.status(403).json({
        message: "Incorrect credentials",
      });
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    } else {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
});

app.get("/todos", auth, async (req, res) => {
  const userId = req.userId;

  try {
    const todos = await TodoModel.find({ userId: userId });
    const titles = todos.map(todo => todo.title);

    console.log(titles);
    res.json({
      titles: titles
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});



app.post("/todo", auth, async (req, res) => {
  try {
    const { title } = todoSchema.parse(req.body);
    const userId = req.userId;

    await TodoModel.create({
      userId: userId,
      title: title,
      done: false,
    });

    res.json({
      userId: userId,
      message: "Todo created",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    } else {
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
});

app.listen(3000);