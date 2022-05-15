const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const margin = 40;
const cyclesPerCall = 5;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;

const ctx = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");


//On first load setup
let road = new Road(carCanvas.width / 2, carCanvas.width - margin, Math.floor(3));
let trafficLayout = new TrafficLayout(road, 40, 200, -400);

let cars = generateCars(500);
let bestCar = cars[0];
let focusCar = cars[0];


let closestToEnd = 999999999;
let prevValue = closestToEnd;
let consecValueNonChanges = 0;

if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"))
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, 0.15)
        }
    }
}



//Generates generation population
function generateCars(N) {
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, true))
    }
    return cars;
}



function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
    localStorage.removeItem("bestBrain");
    window.location = window.location.href;
}

function getBest() {
    focusCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y))); //Current focus of the window - NOT THE OVERALL BEST PERFORMING

    if (focusCar.y < trafficLayout.traffic[trafficLayout.traffic.length - 1].y - 100) {
        bestCar = focusCar;
        save();
        return;
    }
    if (closestToEnd > distBetweenY(trafficLayout.traffic[trafficLayout.traffic.length - 1].y, focusCar.y)) {
        closestToEnd = distBetweenY(trafficLayout.traffic[trafficLayout.traffic.length - 1].y, focusCar.y);
        bestCar = focusCar;
    }
}



animate();

function animate(time) {

    for (let count = 0; count < cyclesPerCall; count++) {
        for (let i = 0; i < trafficLayout.traffic.length; i++) {
            trafficLayout.traffic[i].update(road.borders, []);
        }

        for (let i = 0; i < cars.length; i++) {
            cars[i].update(road.borders, trafficLayout.traffic);

        }

        getBest(); //Update focus & best value

        if (closestToEnd == prevValue) {
            consecValueNonChanges++;
        } else {
            prevValue = closestToEnd;
            consecValueNonChanges = 0;
        }

        if (consecValueNonChanges > 300) { //Time without improvements ends generation
            save(); //Saves best of the this generation
            window.location = window.location.href; //Reset game and animation frame
        }
    }

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;



    ctx.save();
    ctx.translate(0, -focusCar.y + carCanvas.height * 0.7);

    road.draw(ctx);
    for (let i = 0; i < trafficLayout.traffic.length; i++) {
        trafficLayout.traffic[i].draw(ctx, "red");
    }

    ctx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
        cars[i].draw(ctx, "blue");
    }
    ctx.globalAlpha = 1;
    focusCar.draw(ctx, "blue", true);
    ctx.restore();






    networkCTX.lineDashOffset = -time / 50;
    Visualiser.drawNetwork(networkCTX, focusCar.brain);
    requestAnimationFrame(animate);
}