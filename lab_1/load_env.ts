// this file lets you use the dotenv package to see the content inside your .env file

// import it first
import dotenv from "dotenv"

// load the cofig file

dotenv.config()

// now start using it 

const secret_key=process.env.SECRET_KEY;
const public_key=process.env.public_key;

console.log(secret_key);
console.log(public_key);