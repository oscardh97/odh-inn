const moment = require("moment");
const lodash = require("lodash");

const {
    requestController,
    roomController,
    reservationController
} = require("./index.js");

const answers = require("../../inputs/answers.json");
const requests = require("../../inputs/requests.json");
const reservations = require("../../inputs/reservations.json");
const rooms = require("../../inputs/rooms.json");

/**
 * Check if the simulation reservations are correct
 * @param {Object} simulation
 * 
 * @return {Boolean}
 */
const validateAnswers = ({ answers, reservations }) => {
    return lodash.isEqual(answers, reservations);
};

/**
 * Add Reservations to the simulation
 * @param {Object[]} newReservations - Raw data Reservations
 */
const loadReservations = (newReservations = reservations) => {
    const validReservations = [];
    
    newReservations.forEach(_reservation => {
        const newReservation = reservationController.createReservation(_reservation);

        if (newReservation !== null) {
            validReservations.push(newReservation);
        }
    });

    return validReservations;
};

/**
 * Add rooms to the simulation and create a room map based on number of beds by room and if it allows smoking
 * @param {Object[]} newRooms - Raw data rooms
 */
const loadRooms = (newRooms = rooms) => {
    const roomsMap = {};
    const validRooms = [];
    
    newRooms.forEach(_room => {
        const newRoom = roomController.createRoom(_room);

        if (newRoom !== null) {
            const subCategory = newRoom.allow_smoking ? "smoking" : "no_smoking";
    
            const roomsByBeds = roomsMap[newRoom.num_beds] = roomsMap[newRoom.num_beds] || {};
            roomsByBeds[subCategory] = roomsByBeds[subCategory] || [];
            
            roomsMap[newRoom.num_beds][subCategory].push(newRoom);
            validRooms.push(newRoom);
        }
    });

    return {
        roomsMap,
        validRooms
    };
};

/**
 * Add requests to the simulation
 * @param {Object[]} newRequests - Raw data requests
 */
const loadRequests = (newRequests = requests) => {
    const _newRequests = [];

    newRequests.forEach(_request => {
        const newRequest = requestController.createRequest(_request);
        
        newRequest && _newRequests.push(newRequest);
    });
    return newRequests;
}

/**
 * Find the best room options for a requests
 * @param {Request} 
 * @param {Integer} Request.min_beds - Minimum number of beds that the guest would like to stay in (always 1 or 2). Guests requesting 1 bed may stay in either singles or doubles in rooms schema.
 * @param {Boolean} Request.is_smoker - Whether the guest is a smoker. Must match to allow_smoking under rooms.
 * @param {String} Request.checkin_date - Date of check in. Duration of the stay cannot overlap another reservation.
 * @param {String} Request.checkout_date - Date of check out. Duration of the stay cannot overlap another reservation.
 * 
 * @return {Rooms[]} All suitables rooms by given request
 */
const findRoomOptions = (simulation, {
    min_beds,
    is_smoker,
    checkin_date,
    checkout_date
}) => {
    const subCategory = is_smoker ? "smoking" : "no_smoking";
    const checkInDate = moment(checkin_date);
    const checkOutDate = moment(checkout_date);
    const stayDays = checkOutDate.diff(checkInDate, 'd');
    let suitableRooms = simulation.roomsMap[2][subCategory];
    
    // When a guest requests a single, it may assign a double bed
    if (min_beds === 1) {
        suitableRooms = suitableRooms.concat(simulation.roomsMap[1][subCategory]);
    }

    // Sort the rooms array so whenever there are multiple available rooms for a request, assign the room with the lower final price. 
    suitableRooms.sort((a, b) => {
        const cost1 = a.cleaning_fee + (a.daily_rate * stayDays);
        const cost2 = b.cleaning_fee + (b.daily_rate * stayDays);

        return cost1 - cost2;
    });

    return suitableRooms;
};

/**
 * Find the best room option and add the new reservation
 * @param {Object} simulation
 * @param {Request} request
 * @param {Rooms[]} suitableRooms - Rooms that matches guest request
 */
const findAvailableRoom = (simulation, request, suitableRooms) => {
    for (let ROOM_INDEX in suitableRooms) {
        const currentRoom = suitableRooms[ROOM_INDEX];
        let available = false;
        const checkInDate = moment(request.checkin_date);
        const checkOutDate = moment(request.checkout_date);
        let currentReservation = null;

        // Check if there's a reservation for this room
        for (let RESERVATION_INDEX in simulation.reservations) {
            if (simulation.reservations[RESERVATION_INDEX].room_id === currentRoom.id) {
                currentReservation = simulation.reservations[RESERVATION_INDEX];
            }
        }

        // If there's a reservation for this room, checks if it's available by request dates
        if (currentReservation) {
            const reservationCheckInDate = moment(currentReservation.checkin_date);
            const reservationCheckOutDate = moment(currentReservation.checkout_date);
            if (checkOutDate.diff(reservationCheckInDate) <= 0 || checkInDate.diff(reservationCheckOutDate) >= 0) {
                available = true;
            }

        }

        // Create a new Reservation is the room is available
        if (!currentReservation || available) {
            const stayDays = checkOutDate.diff(checkInDate, 'd');
            const newReservation = reservationController.createReservation({
                room_id: currentRoom.id,
                checkin_date: request.checkin_date,
                checkout_date: request.checkout_date,
                total_charge: currentRoom.cleaning_fee + (currentRoom.daily_rate * stayDays)
            });

            if (newReservation !== null) {
                simulation.reservations.push(newReservation);
            }

            return newReservation;
        }
    }
};

/**
 * Given a simulation, process all the requests
 * @simulation {Object} Simulation params
 */
const processRequests = (simulation) => {

    // Process requests one by one as if they were real time requests.
    simulation.requests.forEach((_request) => {
        const suitableRooms = findRoomOptions(simulation, _request); // Rooms that fits the guest request
        findAvailableRoom(simulation, _request, suitableRooms);
        
    });
};

/**
 * Run the simulation with the given files in the inputs folder
 * 
 * @return {
 *  @isValid {boolean} It's true in case answers and reservations arrays matches
 *  @requests {Request[]} All the requests in this simulation
 *  @rooms {Room[]} All the rooms in the hotel
 *  @reservations {Reservation[]} All the reservations
 *  @answers {Object[]} All the given answers
 * }
 */
const run = () => {
    const newSimulation = {
        isValid: false,
        requests: [],
        rooms: [],
        reservations: [],
        roomsMap: {
            1: {},  // Single rooms
            2: {}   // Double rooms
        },
        answers
    };
    
    // Load the input values
    const { roomsMap, validRooms } = loadRooms();
    newSimulation.roomsMap = roomsMap;
    newSimulation.rooms = validRooms;

    newSimulation.reservations = loadReservations();
    
    newSimulation.requests = loadRequests();

    //Process the given requests
    processRequests(newSimulation);

    //Validate the processed requests
    newSimulation.isValid = validateAnswers(newSimulation);
    return newSimulation;
};

module.exports = {
    run
};