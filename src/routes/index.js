const router = require("express").Router({ mergeParams: true });

const localSimulation = require("./localSimulation.js");

router.use("/local_simulation", localSimulation);

module.exports = router;
