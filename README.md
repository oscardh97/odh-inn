# Hotel Simulation


Thechnolgies used:

- Node
## Features

- Load data
- Hotel simulation


## Installation

Install the dependencies and devDependencies and start the server.

```sh
npm i
npm run dev
```

For production environments...

```sh
npm i
npm start
```
## Use
There's only one endpoint that runs the simulation.
#### Method: Get
#### URL:
```sh
localhost:8080/api/simulation/run
```

## Questions
1. How long did it take you to complete this assignment? Did you get stuck anywhere?
    Around 6-8hrs. I didn't get stuck.
2. - Please analyze the runtime complexity of your solution in terms of Big O.
        The algorithm is O(n^2) since we want to sort the rooms by the lower cost so we have to sort the array, we could use a Merge algorithm to change the complexity to O(nLog(n). 
    ```
            suitableRooms.sort((a, b) => {
                const cost1 = a.cleaning_fee + (a.daily_rate * stayDays);
                const cost2 = b.cleaning_fee + (b.daily_rate * stayDays);
                return cost1 - cost2;
            });
    ```
    -  Is your algorithm fast enough for 1000 requests?
        Yes, it is. The most complex thing is sorting suitableRooms and since is a subset of the rooms it wouldn't be a problem.
3. Imagine a system in which it adjusted prices depending on various factors such as number of remaining availability, weekends, or whether there was an event in town that weekend. How might you accommodate this change through the schema?
    - I'd modify the room schema to allow to stored different types of rates and also create a new Schema for Events. So when a  new request gets in, I'll check if there are events on those days and if there are we'll use the rate for that event type.
    ### Room Schema
```
    {
        id,
        num_beds,
        allow_smoking,
        cleaning_fee,
        rates: {
            normal,
            weekend,
            holiday,
            low_availability,
            ...
        }
    }
```


### Event Schema
```
    {
        start_date,
        end_date,
        rate_type (normal, weekend, holiday, low_availability, ...)
    }
```