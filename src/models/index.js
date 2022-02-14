const Validator = require('jsonschema').Validator;

const Request = require("./request.js");
const Reservation = require("./reservation.js");
const Room = require("./room.js");

const schemas = {
    Request,
    Reservation,
    Room
};

const schemaValidator = new Validator();
schemaValidator.addSchema(Request);
schemaValidator.addSchema(Reservation);
schemaValidator.addSchema(Room);

const validate = (input, schemaName) => {
    const retVal = {
        errorMessage: [],
        valid: false
    };
    if (!schemas[schemaName]) {
        retVal.errorMessage = "Invalid Schema name";
    } else {
        const validation = schemaValidator.validate(input, schemas[schemaName]);
        if (validation.errors.length > 0) {
            retVal.errorMessage = validation.errors.reduce((prevVal, currVal, index) => {
                return index === 0 ? currVal.stack : `${prevVal.stack}\n${currVal.stack}`;
            });
        } else {
            retVal.valid = true;
        }
    }

    return retVal;
};

module.exports = {
    Validator: schemaValidator,
    validate,
    ...schemas
};