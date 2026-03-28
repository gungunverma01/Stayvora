const { models } = require("mongoose");
const Listing = require("../models/listing");
module.exports.index = async(req,res)=>{
  const allListings = await Listing.find({});
//   res.render("/listings/index.ejs" , {allListings});
res.render("listings/index", { allListings });
}

module.exports.renderNewForm = (req,res)=>{
  
    res.render("listings/new.ejs" )
}

module.exports.showListing = async(req,res)=>{
      let {id} = req.params;
      const listing = await Listing.findById(id).
      populate({
           path: "reviews",
           populate:{
            path:"author"
           },
      })
      .populate("owner");
      if(!listing) {
        req.flash("error", "Listing Not Exist");
        return res.redirect("/listings");
      }
      console.log(listing);
      res.render("listings/show.ejs", {listing});
}

module.exports.createListing = async (req, res, next ) => {
      let url = req.file.path;
      let filename = req.file.filename;
      
      
      const newListing = new Listing(req.body.listing); // ✅ Use nested `listing` object
      newListing.owner = req.user._id;
      newListing.image = {url, filename};
      await newListing.save();
      req.flash("success", "New Listing Created");
      res.redirect("/listings"); 
    
  }

module.exports.renderEdit = async (req,res) => {
      let { id } = req.params;
      const listing = await Listing.findById(id);
      if(!listing) {
        req.flash("error", "Listing Not Exist");
        return res.redirect("/listings");
      }
      res.render("listings/edit.ejs" , { listing });
}

// module.exports.updateListing = async (req, res) => {

//     let { id } = req.params;

//     // 🟢 If image field is empty → set default image
//     if (
//       !req.body.listing.image ||
//       !req.body.listing.image.url ||
//       req.body.listing.image.url.trim() === ""
//     ) {
//       req.body.listing.image = {
//         url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
//         filename: "default-image"
//       };
//     }

//     let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
      
//       if(typeof req.file !== "undefined"){
//       let url = req.file.path;
//       let filename = req.file.filename;
//       listing.image = { url,filename };
//       await listing.save(); }

//     req.flash("success", "Listing Updated Successfully!");
//     res.redirect(`/listings/${id}`);
//   }


module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);

  // update text fields
  listing.title = req.body.listing.title;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;
  listing.description = req.body.listing.description;

  // 🔥 ONLY update image if new file uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  }

  await listing.save();

  req.flash("success", "Listing Updated Successfully!");
  res.redirect(`/listings/${id}`);
};



module.exports.destroyListing = async(req,res)=>{
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "New Listing Deleted");
    res.redirect("/listings");
}