const moment = require("moment");

const requestController = require("./request.js");
const answers = require("../../inputs/answers.json");
const requests = require("../../inputs/requests.json");
const reservations = require("../../inputs/reservations.json");
const rooms = require("../../inputs/rooms.json");


const loadRooms = (newRooms = rooms) => {
    const roomsMap = {};
    
    newRooms.forEach(_room => {
        const subCategory = _room.allow_smoking ? "smoking" : "no_smoking";

        const roomsByBeds = roomsMap[_room.num_beds] = roomsMap[_room.num_beds] || {};
        roomsByBeds[subCategory] = roomsByBeds[subCategory] || [];
        
        roomsMap[_room.num_beds][subCategory].push(_room);
    });

    return roomsMap;
};

const loadReservations = (newReservations = reservations) => {
    const reservationsMap = {};
    
    newReservations.forEach(_reservation => {
        reservationsMap[_reservation.room_id] = reservationsMap[_reservation.room_id] || [];
        reservationsMap[_reservation.room_id].push(_reservation);
    });

    return reservationsMap;
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
        id,
        min_beds,
        is_smoker,
        checkin_date,
        checkout_date
    }) => {
        const subCategory = is_smoker ? "smoking" : "no_smoking";
        const checkInDate = moment(checkin_date);
        const checkOutDate = moment(checkout_date);
        const stayDays = checkOutDate.diff(checkInDate, 'd');
        const suitableRooms = simulation.rooms[2][subCategory];

        if (min_beds === 1) {
            suitableRooms.concat(simulation.rooms[1][subCategory]);
        }

        suitableRooms.sort((a, b) => {
            const cost1 = a.cleaning_fee + (a.daily_rate + stayDays);
            const cost2 = b.cleaning_fee + (b.daily_rate + stayDays);

            return cost1 - cost2;
        });

        return suitableRooms;
    }

    simulation.requests.forEach((_request) => {
        const suitableRooms = findRoomOptions(_request);
    });

}

const run = () => {
    const newSimulation = {
        requests: [],
        reservations: reservations,
        rooms: {
            1: {},  // Single rooms
            2: {}   // Double rooms
        },
        answers: []
    };

    newSimulation.rooms = loadRooms();
    newSimulation.requests = loadRequests();
    newSimulation.reservations = loadReservations();
    processRequests(newSimulation);
}

module.exports = {
    run
};