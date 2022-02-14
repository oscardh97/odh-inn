const requestSchema = {
    id: "/RequestSchema",
    type: "object",
    properties: {
        // Unique id of the request
        id: { type: "string", required: true },
        // Minimum number of beds that the guest would like to stay in (always 1 or 2). Guests requesting 1 bed may stay in either singles or doubles in rooms schema.
        min_beds: { type: "integer", minimum: 1 },
        // Whether the guest is a smoker. Must match to allow_smoking under rooms.
        is_smoker: { type: "boolean" },
        // Date of check in. Duration of the stay cannot overlap another reservation.
        checkin_date: { type: "string", required: true },
        // Date of check out. Duration of the stay cannot overlap another reservation.
        checkout_date: { type: "string", required: true },
    }
};

module.exports = requestSchema;