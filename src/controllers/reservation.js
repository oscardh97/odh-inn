const { validate } = require("../models/index.js");

const createReservation = (input) => {
    const { valid } = validate(input, "Reservation");
    return valid ? input : null;
};

module.exports = {
    createReservation
}