const { validate } = require("../models/index.js");

const createRequest = (input) => {
    if (input.min_beds < 1 || input.min_beds > 2) {
        return null;
    }
    const { valid } = validate(input, "Request");
    return valid ? input : null;
};

module.exports = {
    createRequest
}