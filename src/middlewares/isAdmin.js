module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).render("errors/403", { hideNavbar: true });
  }
  next();
};
