const reservationSchema = {
    id: "/ReservationSchema",
    type: "object",
    properties: {
        // Reference to the room that is reserved
        room_id: { type: "string", required: true },
        // Start date of the reservation in YYYY-MM-DD format (ISO8601)
        checkin_date: { type: "string", required: true },
        // End date of the reservation in YYYY-MM-DD format (ISO8601)
        checkout_date: { type: "string", required: true },
        // The total price (in dollars) for this reservation
        total_charge: { type: "number" }
    }
};

module.exports = reservationSchema;