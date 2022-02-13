const router = require("express").Router({ mergeParams: true });

const simulation = require("./simulation.js");

router.use("/simulation", simulation);

module.exports = router;
