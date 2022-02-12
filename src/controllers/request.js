const { validate, Request } = require("../models/index.js");

const createRequest = (input) => {
    const { valid } = validate(input, "Request");
    return valid ? input : null;
};

module.exports = {
    createRequest
}