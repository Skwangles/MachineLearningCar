// CODE WAS IMPROVED FROM https://www.youtube.com/watch?v=Rs_rAxEsAvI&t=5028s

const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const margin = 40;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 500;
const completed = false;
const ctx = carCanvas.getContext("2d");
const networkCTX = networkCanvas.getContext("2d");



//User specified values
let cyclesPerCall = 7;
let N = 500;
let mutationAmp = 0.2;

if (localStorage.getItem("speed")) {
    document.getElementById("speed").value = localStorage.getItem("speed");
    cyclesPerCall = localStorage.getItem("speed")
} else {
    //Default values
    localStorage.setItem("speed", cyclesPerCall);
    document.getElementById("speed").value = cyclesPerCall;
}


if (localStorage.getItem("cars")) {
    document.getElementById("cars").value = localStorage.getItem("cars");
    N = localStorage.getItem("cars");
} else {
    //Default values
    localStorage.setItem("cars", N);
    document.getElementById("cars").value = N;
}

if (localStorage.getItem("variation")) {
    document.getElementById("variation").value = localStorage.getItem("variation");
    mutationAmp = localStorage.getItem("variation");
} else {
    localStorage.setItem("variation", mutationAmp);
    document.getElementById("variation").value = mutationAmp;
}


if (localStorage.getItem("genNum")) {
    localStorage.setItem("genNum", parseInt(localStorage.getItem("genNum")) + 1);
} else {
    localStorage.setItem("genNum", 0);
}
document.getElementById("gencount").innerHTML = "Generation: " + localStorage.getItem("genNum");


//Update saved values
function updateSpeed(speed) {
    cyclesPerCall = speed;
    localStorage.setItem("speed", cyclesPerCall);
}

function updateCars(cars) {
    N = cars;
    localStorage.setItem("cars", N);
}

function updateVariation(variation) {
    mutationAmp = variation;
    localStorage.setItem("variation", mutationAmp);
}






//On first load setup
let road = new Road(carCanvas.width / 2, carCanvas.width - margin, Math.floor(3));
let trafficLayout = new TrafficLayout(road, 40, 200, -400);

let cars = generateCars(N);
let bestPerformingCar = cars[0];
let focusCar = cars[0];

//Configuring generation counting
let closestToEnd = 999999999;
let prevValue = closestToEnd;
let consecValueNonChanges = 0;



if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"))
        if (i != 0) {
            NeuralNetwork.mutate(cars[i].brain, mutationAmp)
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


/**
 * Save the best best, so it is not lost on reload
 */
function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestPerformingCar.brain));
}

/**
 * Discard & reset AI training
 */
function discard() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("genNum");
    window.location = window.location.href;
}

/**
 * Determine which car has the best fitness (that which is closest to beyond the final traffic item)
 * @returns 
 */
function getBest() {
    focusCar = cars.find(c => c.y == Math.min(...cars.map(c => c.y))); //Current focus of the window - NOT THE OVERALL BEST PERFORMING

    if (focusCar.y < trafficLayout.traffic[trafficLayout.traffic.length - 1].y - 100) {
        bestPerformingCar = focusCar;
        save();
        completed = true;
        return;
    }
    if (closestToEnd > distBetweenY(trafficLayout.traffic[trafficLayout.traffic.length - 1].y, focusCar.y)) {
        closestToEnd = distBetweenY(trafficLayout.traffic[trafficLayout.traffic.length - 1].y, focusCar.y);
        bestPerformingCar = focusCar;
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


        //End trainging
        if (completed == true) {
            document.getElementById("gencount").innerHTML = "SUCCESS!<br/>(Click button to restart training)<br/>Problem solved on generation: " + localStorage.getItem("genNum");

            networkCTX.lineDashOffset = -time / 50;
            Visualiser.drawNetwork(networkCTX, focusCar.brain);
            return; //Cease drawing frames - winner is found
        }

        //Generation control
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

    //Drawing physical shapes
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