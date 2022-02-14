const { validate } = require("../models/index.js");

const createRoom = (input) => {
    if (input.num_beds < 1 || input.num_beds > 2) {
        return null;
    }
    const { valid } = validate(input, "Room");
    return valid ? input : null;
};

module.exports = {
    createRoom
}