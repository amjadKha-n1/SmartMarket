const notFound = (req, res, next) => {
  res.status(404).render("errors/404", {
    url: req.originalUrl,
    hideNavbar: true,
  });
};

module.exports = notFound;
