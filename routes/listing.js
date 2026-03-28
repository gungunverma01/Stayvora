const express = require("express");
const router = express.Router();



const wrapAsyc = require("../utils/wrapAsyc.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing")
const {isLoggedIn} = require("../middleware.js");
const {isOwner } = require("../middleware.js");
const {validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require('multer');
const { storage } = require("../cloudConfig");
const upload = multer({  storage });



router
  .route("/")
  .get(wrapAsyc(listingController.index))
  .post(
    isLoggedIn,
    
    upload.single("listing[image]"),
    validateListing,
    wrapAsyc(listingController.createListing)
  );




//new route
router.get("/new" , isLoggedIn , listingController.renderNewForm) ;


router
.route("/:id")
.get( wrapAsyc(listingController.showListing))
.put(
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsyc(listingController.updateListing)
)
.delete( isLoggedIn , isOwner, wrapAsyc(listingController.destroyListing));

// edit route
router.get("/:id/edit", isLoggedIn , isOwner, wrapAsyc(listingController.renderEdit));

module.exports = router;





