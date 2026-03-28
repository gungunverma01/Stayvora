const express = require("express");
const {validateReview } = require("../middleware.js");
const router = express.Router({mergeParams: true});
const { isLoggedIn } = require("../middleware.js");
const wrapAsyc = require("../utils/wrapAsyc.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isreviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// /review 
// post route
router.post("/", isLoggedIn , validateReview, wrapAsyc( reviewController.createReview));


// delete route review

router.delete(
  "/:reviewId",
  isLoggedIn,
  isreviewAuthor,
  wrapAsyc(reviewController.destroyReview)
);


module.exports = router;