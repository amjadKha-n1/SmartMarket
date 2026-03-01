const User = require('../models/User');

async function checkAuthStatus(req, res, next) {

    const uid = req.session ? req.session.uid: null;

    // Always define locals (important!)
    res.locals.uid = null;
    res.locals.role = null;
    res.locals.user = null;

    if (!uid) {
        return next();
    }

    try {
        const user = await User.findById(uid);

        // user deleted but session still exists
        if (!user) {
            req.session.destroy(() => next());
            return;
        }

        // attaching user to request (for controllers)
        req.user = user;
        // attaching user to views(for ejs)
        res.locals.user = user;
        res.locals.uid = uid;
        res.locals.role = user.role;

    } catch (err) {
        console.error('Auth middleware error!', err);
    }

    next();
}

module.exports = checkAuthStatus;
