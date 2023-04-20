import { imageContext } from "../images";


let viewport = {x: 500, y: 200}
let landmarks;

class Landmark {
    // height: landmark height in meters
    // distance: landmark distance from eye in meters
    constructor(width, height, distance, xPos, filename=null) {
        this.width = width;
        this.height = height;
        this.distance = distance;
        this.perspective = {x: xPos,top: {}, bottom: {}};
        this.filename = filename;
    }

    calculatePerspective(eyeHeight) {
        let R = 6371000; // Radius of earth in meters
        let horizon = R * Math.acos(R/(R + eyeHeight)); // distance to horizon in meters
        let fov = 55 * Math.PI / 180; // Field od vision in radians
    
        let viewingAngle = Math.atan(eyeHeight / horizon); // angle between ground and eyeline

       // angle between the ground and a line passing through the bottom of the object
       this.perspective.bottom.angle = Math.atan(eyeHeight / this.distance);
       let eyeBottomAngle = this.perspective.bottom.angle - viewingAngle;
       let bottomLine = Math.sqrt(Math.pow(eyeHeight, 2) + Math.pow(this.distance, 2));

       //how far up / down the bottom appears from the horizon
       this.perspective.bottom.offset = Math.sin(eyeBottomAngle) * bottomLine;
     
        let eyelineAtObject = this.perspective.bottom.offset / Math.tan(eyeBottomAngle);
        let viewportScaled = Math.tan(fov/2) * 2 * eyelineAtObject;
       
        this.perspective.bottom.y = this.perspective.bottom.offset * viewport.y / viewportScaled;
    
        this.perspective.pixelHeight = this.height * viewport.y / viewportScaled;
        this.perspective.top.y = this.perspective.bottom.y - this.perspective.pixelHeight;
        this.perspective.pixelWidth = this.width * this.perspective.pixelHeight / this.height;

    }
    
    draw(canvasId) {
        var canvas = document.getElementById(canvasId);
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        const topLeft = {x: this.perspective.x - this.perspective.pixelWidth/2, y: viewport.y/2 + this.perspective.top.y};
      //  var holding = document.getElementById('image-hold');
        var img = document.createElement('img');
        img.src = this.filename;
        //holding.appendChild(img);
      
        ctx.drawImage(img, topLeft.x, topLeft.y, this.perspective.pixelWidth, this.perspective.pixelHeight);
        //
    
    }
}


function drawHorizon(canvasId, height) {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext("2d");
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#5588FF";
    ctx.fillRect(0, 0, viewport.x,viewport.y/2);
    ctx.fillStyle = "#55CC22";
    ctx.fillRect(0, viewport.y/2, viewport.x, viewport.y);
}



function createLandmarks() {
    let landmarks = [];
    let buildings = [
        {name: 'Independance Hall', height: 51, width: 32, distance: 20, x: viewport.x/2 - 32, id: 1  },
        {name: 'Art Museum', height: 60, width: 160, distance: randomInteger(70,200), x:  randomInteger(0,viewport.x - 160), id: 2},
        {name: 'City Hall', height: 157, width: 128, distance: randomInteger(200,300), x: randomInteger(0,viewport.x - 128), id: 3},
        {name: 'Liberty 1', height: 288, width: 117, distance: randomInteger(300,400),x:  randomInteger(0,viewport.x - 11), id: 6},
        {name: 'Comcast Center', height: 342, width: 107, distance: randomInteger(400,500),x: randomInteger(0,viewport.x - 107), id: 5},

    ];
    buildings.sort((a, b) => b.height - a.height);
    for (let i = 0; i < buildings.length; i++) {
        const building = buildings[i];
        const filename = imageContext('./images/buildings/Asset ' + building.id + '.png');
        landmarks.push(new Landmark(building.width, building.height, building.distance, building.x, filename));
        
    }
    return landmarks;
}

function updateViewport(canvasId, height) {
    
    drawHorizon(canvasId, height);
    if (!landmarks) landmarks = createLandmarks();
    updateLandmarks(height, landmarks, canvasId);
}

function updateLandmarks(height, landmarks, canvasId) {
    for (let i = 0 ; i < landmarks.length; i++){
        let landmark = landmarks[i];
        landmark.calculatePerspective(height);
        landmark.draw(canvasId);
    }
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  


export default updateViewport;