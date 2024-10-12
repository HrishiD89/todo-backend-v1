import express from "express";
import { UserModel, TodoModel } from "./db.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { auth, JWT_SECRET } from "./auth.js";
import bcrypt from "bcrypt";
import cors from "cors";
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
app.use(cors());

// Zod schemas
const signupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[@$!%*?&]/, { message: "Password must contain at least one special character" }),
});


const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const todoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
});

app.post("/signup", async (req, res) => {
  try {
    // Validate the request body using the Zod schema
    const { name, email, password } = signupSchema.parse(req.body);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    await UserModel.create({
      email,
      password: hashedPassword,
      name,
    });

    // Send a success response
    res.json({
      message: "You are signed up",
    });
  } catch (err) {
    // Handle validation errors
    if (err instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    } else {
      // Handle other errors
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
        message: "Something went wrong with Todo",
      });
    }
  }
});

app.get("/todos", auth, async (req, res) => {
  const userId = req.userId;

  try {
    const todos = await TodoModel.find({ userId: userId });
    const titles = todos.map(todo =>{
      return {
        id: todo._id.toString(),
        title : todo.title,
        category: todo.category
      }
    });

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
    const { title,category } = todoSchema.parse(req.body);
    const userId = req.userId;

    await TodoModel.create({
      userId: userId,
      title: title,
      category:category,
      done: false,
    });

    res.json({
      userId: userId,
      title: title,
      category: category,
      message: "Todo created"
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


app.put('/todo', auth, async (req, res) => {
  const userId = req.userId;
  const todoId = req.headers.todoid;

  try{
    const {title,category} = req.body;
    if(userId){
      const updateTodo = await TodoModel.findOneAndUpdate(
        {_id:todoId,userId},
        {
          title,
          category,
        },
        {new : true}
      )
      if(!updateTodo){
        res.status(403).json({
          message:"todo not found",
        })
      }else{
        res.json({
          message: "course updated successfully",
        });
      }
    }
  }catch (error) {
    console.error(error);
    res.status(403).json({
      message: "validation error",
    });
  }
})

app.delete('/todo',auth,async (req,res)=>{
  const userId = req.userId;
  const todoId = req.headers.todoid;

  try {
    if(userId){
      const deleteTodo = await TodoModel.findByIdAndDelete({
        _id:todoId,userId
      })

    if(!deleteTodo){
      res.status(403).json({
        message:" todo not found",
      })
    }else{
      res.json({
        message: "todo deleted successfully",
      });
    }
    }
  } catch (error) {
    console.error(error);
    res.json({
      message: "validation error",
    });
  }

})

app.listen(3000);