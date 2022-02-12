const router = require("express").Router({ mergeParams: true });

const simulationController = require("../controllers/simulation.js");

router.post("/", (req, res) => {
    simulationController.run();
});

module.exports = router;