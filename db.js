import mongoose from "mongoose";

const Schema = mongoose.Schema;
const objectId = Schema.ObjectId;

const User = new Schema({
    name: String,
    email: {
        type : String,
        unique:true
    },
    password: String
});

const Todos = new Schema({
    userId: objectId,
    title: String,
    done:Boolean
});


const UserModel = mongoose.model("user", User);
const TodoModel = mongoose.model("todos", Todos);

export { UserModel, TodoModel };