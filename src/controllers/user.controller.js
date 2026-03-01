const Seller = require('../models/Seller');
const User = require('../models/User');
exports.becomeSeller = async (req, res) => {
    if (!req.session.uid) {
        return res.redirect('/login');
    }
    res.render('user/become-seller', { hideNavbar: false });
}

exports.submitBecomeSeller = async(req, res) => {
    const userId = req.session.uid;
    if (!userId) {
        return res.redirect('/login');
    }
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        return res.status(400).send('User not found!');
    }
    const storeNameInput = req.body.storeName;
    const storeDescriptionInput = req.body.storeDescription;

    const existingSeller = await Seller.findOne({ userId: currentUser._id });
    if (existingSeller) {
        return res.status(400).send('You already have a seller account or pending request.')
    }

    try {
        if (!req.file) {
            return res.redirect('/becomeSeller');
        };
        const imagePath = req.file.path;
        const newSeller = new Seller({
            userId: currentUser._id,
            storeName: storeNameInput,
            storeDescription: storeDescriptionInput,
            storeLogo: imagePath,
            status: 'pending'
        });
        await newSeller.save();
        res.redirect('/products');
    } catch (error) {
        console.error(error);
        res.redirect('/products');
    }
}

exports.userProfile = async (req, res) => {
    res.render('user/profile', { hideNavbar: false });
}

exports.getAboutPage = async (req, res) => {
    res.render('partials/about', { hideNavbar: false })
}