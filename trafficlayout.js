class TrafficLayout {
    /**
     * Creates traffice entrie
     * @param {*} road 
     * @param {*} carLevels 
     * @param {*} gapSize 
     * @param {*} baseY 
     * @returns 
     */
    constructor(road, carLevels, gapSize, baseY) {
        this.road = road;
        this.carLevels = carLevels;
        this.gapSize = gapSize;
        this.baseY = baseY;
        this.generateLevel();
    }


    /**
     * Creates random layout of the traffic obstacles
     * @returns array of traffic obstacles
     */
    generateLevel() {
        this.traffic = [

            new Car(road.getLaneCenter(1), -100, 30, 50, false, 2),
            new Car(road.getLaneCenter(0), -300, 30, 50, false, 2),
            new Car(road.getLaneCenter(2), -300, 30, 50, false, 2),
            new Car(road.getLaneCenter(0), -500, 30, 50, false, 2),
            new Car(road.getLaneCenter(1), -500, 30, 50, false, 2),
            new Car(road.getLaneCenter(1), -700, 30, 50, false, 2),
            new Car(road.getLaneCenter(2), -700, 30, 50, false, 2)

        ];
        // for (let i = 0; i < this.carLevels; i++) {
        //     let carsInLane = Math.random() * (this.road.laneCount - 1);
        //     let takenLanes = [];

        //     for (let items = 0; items < carsInLane; items++) {
        //         let lane = Math.floor(Math.random() * this.road.laneCount);
        //         while (takenLanes.includes(lane)) {
        //             lane = Math.floor(Math.random() * this.road.laneCount);
        //         }
        //         takenLanes.push(lane);
        //         this.traffic.push(new Car(road.getLaneCenter(lane), this.baseY - i * this.gapSize, 30, 50, false, 2))
        //     }
        // }
        return this.traffic;
    }
}