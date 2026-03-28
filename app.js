if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}

// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsyc = require("./utils/wrapAsyc.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



const reviewRouter = require("./routes/review.js");
const listingRouter = require("./routes/listing.js");
const { required } = require("joi");
const userRouter = require("./routes/user.js")

// const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const dburl = process.env.ATLAS_DB_URL;

mongoose.set('strictQuery', true);
main().then(()=>{
    console.log("connected to DB")
}).catch(err =>{
    console.log(err);
});



async function main() {
    await mongoose.connect(dburl);
}

app.set("view engine" , "ejs");
app.set("views" , path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json()); 
app.use(methodOverride("_method"));
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/" ,(req, res)=>{
  res.redirect("/listings");
});




app.use(session(sessionOption));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req, res , next)=>{
   res.locals.success = req.flash("success");
  //  console.log(res.locals.success);   // ✅ correct
   res.locals.error = req.flash("error");
   res.locals.currUser = req.user;
   next();
});





app.get("/demouser", async (req,res)=>{
let fakeUser = new User({
  email:"student@gmail.com",
  username:"delta-student",
})

let registeredUser = await User.register(fakeUser, "password@123");
res.send(registeredUser);
})


// app.get("/testListing" , async(req, res)=>{
//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         price:1200,
//         location: "goa",
//         country: "india"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });








app.use("/listings" , listingRouter );
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/" , userRouter);








// app.use("*" , (req,res,next)=>{
//   next(new ExpressError(404, "page not found"));
// })

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found"));                 //for url error
});

app.use((err, req, res, next)=>{                             //for details error
  let {statusCode= 500, message= "wrong"} = err;
  res.status(statusCode).render("error.ejs" , {message} );
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080");
});