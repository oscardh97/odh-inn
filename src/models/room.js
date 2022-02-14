const roomSchema = {
    id: "/RoomSchema",
    type: "object",
    properties: {
        // Unique id of the room
        id: { type: "string", required: true },
        // Number of beds the room has (always 1 or 2)
        num_beds: { type: "number", required: true },
        // Determines whether smoking or non-smoking room
        allow_smoking: { type: "boolean", required: true },
        // Daily rate (in dollars) used for the calculation of the final price
        daily_rate: { type: "number", required: true },
        // Cleaning fee (in dollars) used to calculate the final price.
        cleaning_fee: { type: "number" }
    }
};

module.exports = roomSchema;