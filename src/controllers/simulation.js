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

const validateAnswers = (simulation) => {
    return lodash.isEqual(simulation.answers, simulation.reservations);
};

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

const loadRequests = (newRequests = requests) => {
    const _newRequests = [];

    newRequests.forEach(_request => {
        const newRequest = requestController.createRequest(_request);
        
        newRequest && _newRequests.push(newRequest);
    });
    return newRequests;
}

const processRequests = (simulation) => {
    const findRoomOptions = ({
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

        if (min_beds === 1) {
            suitableRooms = suitableRooms.concat(simulation.roomsMap[1][subCategory]);
        }

        suitableRooms.sort((a, b) => {
            const cost1 = a.cleaning_fee + (a.daily_rate * stayDays);
            const cost2 = b.cleaning_fee + (b.daily_rate * stayDays);

            return cost1 - cost2;
        });

        return suitableRooms;
    }

    simulation.requests.forEach((_request) => {
        const suitableRooms = findRoomOptions(_request);

        for (let ROOM_INDEX in suitableRooms) {
            const currentRoom = suitableRooms[ROOM_INDEX];
            let available = false;
            const checkInDate = moment(_request.checkin_date);
            const checkOutDate = moment(_request.checkout_date);
            let currentReservation = null;

            for (let RESERVATION_INDEX in simulation.reservations) {
                if (simulation.reservations[RESERVATION_INDEX].room_id === currentRoom.id) {
                    currentReservation = simulation.reservations[RESERVATION_INDEX];
                }
            }

            if (currentReservation) {
                const reservationCheckInDate = moment(currentReservation.checkin_date);
                const reservationCheckOutDate = moment(currentReservation.checkout_date);
                if (checkOutDate.diff(reservationCheckInDate) <= 0 || checkInDate.diff(reservationCheckOutDate) >= 0) {
                    available = true;
                }

            }

            if (!currentReservation || available) {
                const stayDays = checkOutDate.diff(checkInDate, 'd');
                const newReservation = reservationController.createReservation({
                    room_id: currentRoom.id,
                    checkin_date: _request.checkin_date,
                    checkout_date: _request.checkout_date,
                    total_charge: currentRoom.cleaning_fee + (currentRoom.daily_rate * stayDays)
                });

                if (newReservation !== null) {
                    simulation.reservations.push(newReservation);
                }

                break;
            }
        }
    });
};

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

    const { roomsMap, validRooms } = loadRooms();
    newSimulation.roomsMap = roomsMap;
    newSimulation.rooms = validRooms;

    newSimulation.reservations = loadReservations();
    
    newSimulation.requests = loadRequests();
    processRequests(newSimulation);
    newSimulation.isValid = validateAnswers(newSimulation);
    return newSimulation;
};

module.exports = {
    run
};