const Wishlistdb = require('../model/wishlist_model');
const Productdb = require('../model/product_model');
const objectId = require('mongoose').Types.ObjectId;



//product adding to wishlist.......................................................
exports.addToWishlist = async (req, res) => {

    const userId = req.session.user._id;
    const proId = req.params.id;

    const userWishlist = await Wishlistdb.findOne({ userId: objectId(userId) })

    if (userWishlist) {
        let proExist = userWishlist.products.findIndex((product) => {
            let val1 = JSON.stringify(product);
            let val2 = JSON.stringify(objectId(proId));
            if (val1 == val2) {
                return true;
            } else {
                return false;
            }
        })
        if (proExist != -1) {
            // console.log("Removed from wishlist");
            await Wishlistdb.updateOne({ userId: objectId(userId) },
                {
                    $pull: { products: objectId(proId) } //remove product from wishlist..........................
                })
            res.json({ status: false })

        }
        else {
            // console.log("Added to wishlist");
            await Wishlistdb.updateOne({ userId: objectId(userId) },
                {
                    $push: { products: objectId(proId) } //add product to wishlist................................
                })
            res.json({ status: true });
        }
    }
    else {
        let wishlist = new Wishlistdb({
            userId: objectId(userId),
            products: [objectId(proId)]
        })

        wishlist
            .save()
        // console.log(" saved. in wishlist...............");
        res.json({ status: true })
    }
}

exports.myWishlist = async (req, res) => {


    const userId = req.session.user._id;

    let wishlist = await Wishlistdb.aggregate([
        {
            $match: { userId: objectId(userId) }
        },
        {
            $unwind: "$products"
        },
        {
            $lookup: {
                from: "productdbs",
                localField: "products",
                foreignField: "_id",
                as: "productItems"
            }
        }
    ])

    // console.log('wwwwwwwwwww', wishlist);



    if (wishlist) {
        // console.log('wwwwwwwwwwwww',userWishlist);
        res.render('user/my_wishlist', { wishlist })
    }
    else {
        res.render('user/my_wishlist')
    }
}

//Item removing from wishlist...................................................... 
exports.wishlistRemoved = async (req, res) => {
    const proId = req.body.id;
    // console.log('[[[[[[[[[',proId);

    const userId = req.session.user._id;
    // console.log(userId);

    await Wishlistdb.updateOne({ userId: objectId(userId) },
        {
            $pull: { products: objectId(proId) } //remove product from wishlist..........................
        })
    res.json({ status: true })

}



