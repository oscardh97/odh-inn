const router = require("express").Router({ mergeParams: true });

const simulationController = require("../controllers/simulation.js");

/**
 * Run the simulation with the given files in the inputs folder
 * 
 * @return Simulation
 */
router.post("/run", (req, res) => {
    const simulation = simulationController.run();

    return res.json(simulation).send();
});

module.exports = router;