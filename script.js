const game = document.getElementById("game");
const world = document.getElementById("world");
const coordinates = document.getElementById("coordinates");
const weatherStatus = document.getElementById("weatherStatus");
const timeStatus = document.getElementById("timeStatus");
const selectedStatus = document.getElementById("selectedStatus");
const toast = document.getElementById("toast");

const tools = document.querySelectorAll(".tool");
const deleteModeButton = document.getElementById("deleteMode");
const weatherButtons = document.querySelectorAll(".weatherButton");
const dayNightButton = document.getElementById("dayNightButton");

const saveWorldButton = document.getElementById("saveWorld");
const loadWorldButton = document.getElementById("loadWorld");
const clearWorldButton = document.getElementById("clearWorld");
const resetPlayerButton = document.getElementById("resetPlayer");

const editorButton = document.getElementById("editorButton");
const editorPanel = document.getElementById("editorPanel");
const settingsButton = document.getElementById("settingsButton");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

const sizeSlider = document.getElementById("sizeSlider");
const rotationSlider = document.getElementById("rotationSlider");
const speedSlider = document.getElementById("speedSlider");
const gridToggle = document.getElementById("gridToggle");
const animationToggle = document.getElementById("animationToggle");
const applyEditor = document.getElementById("applyEditor");

// ==========================================
// PLAYER
// ==========================================

const player = {
x: 450,
y: 300,
z: 0,
speed: 4,
jumpPower: 12,
verticalSpeed: 0,
onGround: true
};

// ==========================================
// PHYSICS SETTINGS
// ==========================================

const physics = {
gravity: 0.6,
bounce: 0.72,
wind: 0,
friction: 0.96,
waterSlow: 0.45
};

// ==========================================
// GAME STATE
// ==========================================

const keys = {};

let selectedObject = "cube";
let deleteMode = false;
let isNight = false;
let currentWeather = "sunny";

let objectSize = 65;
let objectRotation = 0;

const savedWorldName = "sandboxWorld";

// ==========================================
// OBJECT PHYSICS DATA
// ==========================================

const physicsObjects = new Map();

// ==========================================
// TOAST
// ==========================================

let toastTimer;

function showToast(message) {

if (!toast) {
return;
}

toast.textContent = message;
toast.classList.add("show");

clearTimeout(toastTimer);

toastTimer = setTimeout(function() {
toast.classList.remove("show");
}, 1800);
}

// ==========================================
// KEYBOARD
// ==========================================

document.addEventListener("keydown", function(event) {

keys[event.key.toLowerCase()] = true;

if (event.code === "Space") {
event.preventDefault();
jump();
}

});

document.addEventListener("keyup", function(event) {

keys[event.key.toLowerCase()] = false;

});

// ==========================================
// PLAYER MOVEMENT
// ==========================================

function updatePlayer() {

let movementSpeed = player.speed;

if (isPlayerInWater()) {
movementSpeed *= physics.waterSlow;
}

if (keys["w"]) {
player.y -= movementSpeed;
}

if (keys["s"]) {
player.y += movementSpeed;
}

if (keys["a"]) {
player.x -= movementSpeed;
}

if (keys["d"]) {
player.x += movementSpeed;
}

player.x = Math.max(50, Math.min(850, player.x));
player.y = Math.max(120, Math.min(500, player.y));

if (!player.onGround) {

```
player.verticalSpeed -= physics.gravity;

player.z += player.verticalSpeed;

if (player.z <= 0) {

  player.z = 0;

  if (Math.abs(player.verticalSpeed) > 3) {
    player.verticalSpeed =
      Math.abs(player.verticalSpeed) *
      physics.bounce;
  } else {
    player.verticalSpeed = 0;
    player.onGround = true;
  }

}
```

}

updatePlayerVisual();
updateCamera();
updateCoordinates();
}

// ==========================================
// PLAYER VISUAL
// ==========================================

function updatePlayerVisual() {

const playerElement =
document.getElementById("player");

if (!playerElement) {
return;
}

playerElement.style.left =
player.x + "px";

playerElement.style.top =
(player.y - player.z) + "px";
}

// ==========================================
// PLAYER JUMP
// ==========================================

function jump() {

if (!player.onGround) {
return;
}

player.onGround = false;

player.verticalSpeed =
player.jumpPower;

}

// ==========================================
// CAMERA
// ==========================================

function updateCamera() {

const cameraX =
player.x - 450;

const cameraY =
player.y - 300;

world.style.transform =
`translate(
      calc(-50% - ${cameraX}px),
      calc(-50% - ${cameraY}px)
    )`;
}

// ==========================================
// COORDINATES
// ==========================================

function updateCoordinates() {

coordinates.textContent =
`X: ${Math.round(player.x)}   ` +
`Y: ${Math.round(player.y)}   ` +
`Z: ${Math.round(player.z)}`;
}

// ==========================================
// OBJECT WEIGHT
// ==========================================

function getObjectWeight(type) {

const weights = {
cube: 5,
tree: 12,
ball: 2,
crate: 8,
water: 1,
fire: 0.5,
wall: 15
};

return weights[type] || 5;
}

// ==========================================
// OBJECT PHYSICS
// ==========================================

function registerPhysicsObject(object) {

physicsObjects.set(object, {

```
velocityX: 0,
velocityY: 0,
velocityZ: 0,

grounded: true,

weight:
  getObjectWeight(
    object.dataset.type
  )
```

});

}

function unregisterPhysicsObject(object) {

physicsObjects.delete(object);

}

// ==========================================
// OBJECT POSITION
// ==========================================

function getObjectPosition(object) {

return {

```
x: parseFloat(
  object.style.left
) || 0,

y: parseFloat(
  object.style.top
) || 0
```

};

}

// ==========================================
// APPLY PHYSICS TO OBJECTS
// ==========================================

function updatePhysics() {

physicsObjects.forEach(
function(data, object) {

```
  if (!document.body.contains(object)) {

    physicsObjects.delete(object);
    return;

  }


  const type =
    object.dataset.type;


  // Fire and water don't fall.
  if (
    type === "fire" ||
    type === "water"
  ) {
    return;
  }


  const position =
    getObjectPosition(object);


  // Gravity
  if (!data.grounded) {

    data.velocityZ -=
      physics.gravity;

    let newY =
      position.y -
      data.velocityZ;

    if (newY >= 500) {

      newY = 500;

      if (
        Math.abs(data.velocityZ) >
        3
      ) {

        data.velocityZ =
          -data.velocityZ *
          physics.bounce;

      } else {

        data.velocityZ = 0;
        data.grounded = true;

      }

    }

    object.style.top =
      newY + "px";

  }


  // Wind
  if (physics.wind !== 0) {

    data.velocityX +=
      physics.wind /
      Math.max(data.weight, 1);

  }


  if (Math.abs(data.velocityX) > 0.01) {

    position.x +=
      data.velocityX;

    data.velocityX *=
      physics.friction;

    position.x =
      Math.max(
        0,
        Math.min(870, position.x)
      );

    object.style.left =
      position.x + "px";

  }


  // Ball bounce animation
  if (type === "ball") {

    if (
      !data.grounded &&
      Math.random() < 0.02
    ) {

      data.velocityZ += 0.3;

    }

  }

}
```

);

}

// ==========================================
// OBJECT COLLISION
// ==========================================

function checkObjectCollisions() {

const objects =
Array.from(
physicsObjects.keys()
);

for (
let i = 0;
i < objects.length;
i++
) {

```
for (
  let j = i + 1;
  j < objects.length;
  j++
) {

  const a = objects[i];
  const b = objects[j];

  if (
    !document.body.contains(a) ||
    !document.body.contains(b)
  ) {
    continue;
  }


  const rectA =
    a.getBoundingClientRect();

  const rectB =
    b.getBoundingClientRect();


  const touching =
    rectA.left < rectB.right &&
    rectA.right > rectB.left &&
    rectA.top < rectB.bottom &&
    rectA.bottom > rectB.top;


  if (!touching) {
    continue;
  }


  const dataA =
    physicsObjects.get(a);

  const dataB =
    physicsObjects.get(b);


  if (!dataA || !dataB) {
    continue;
  }


  // Heavier objects push lighter objects.
  if (
    dataA.weight >
    dataB.weight
  ) {

    dataB.velocityX +=
      0.5;

    dataB.grounded = false;

  } else {

    dataA.velocityX -=
      0.5;

    dataA.grounded = false;

  }

}
```

}

}

// ==========================================
// WATER DETECTION
// ==========================================

function isPlayerInWater() {

const waterObjects =
world.querySelectorAll(
'.spawned-object[data-type="water"]'
);

for (
const water of waterObjects
) {

```
const rect =
  water.getBoundingClientRect();

const playerElement =
  document.getElementById("player");

if (!playerElement) {
  return false;
}

const playerRect =
  playerElement.getBoundingClientRect();


if (
  playerRect.left < rect.right &&
  playerRect.right > rect.left &&
  playerRect.top < rect.bottom &&
  playerRect.bottom > rect.top
) {

  return true;

}
```

}

return false;
}

// ==========================================
// OBJECT SELECTION
// ==========================================

tools.forEach(function(tool) {

tool.addEventListener(
"click",
function() {

```
  tools.forEach(function(item) {
    item.classList.remove("active");
  });

  tool.classList.add("active");

  selectedObject =
    tool.dataset.object;

  deleteMode = false;

  deleteModeButton.classList.remove(
    "active"
  );


  const names = {

    cube: "🧱 Cube",
    tree: "🌳 Tree",
    ball: "⚽ Ball",
    crate: "📦 Crate",
    water: "🌊 Water",
    fire: "🔥 Fire",
    wall: "🧱 Wall"

  };


  selectedStatus.textContent =
    (names[selectedObject] ||
      selectedObject) +
    " selected";

}
```

);

});

// ==========================================
// DELETE MODE
// ==========================================

deleteModeButton.addEventListener(
"click",
function() {

```
deleteMode =
  !deleteMode;

deleteModeButton.classList.toggle(
  "active",
  deleteMode
);


if (deleteMode) {

  tools.forEach(function(tool) {
    tool.classList.remove("active");
  });

  selectedStatus.textContent =
    "🗑️ Delete mode";

  showToast(
    "Delete mode enabled"
  );

} else {

  showToast(
    "Delete mode disabled"
  );

}
```

}
);

// ==========================================
// CREATE OBJECT
// ==========================================

function createObject(x, y) {

if (deleteMode) {
return;
}

const object =
document.createElement("div");

object.classList.add(
"spawned-object"
);

object.dataset.type =
selectedObject;

object.style.left =
x + "px";

object.style.top =
y + "px";

object.style.transform =
`rotate(${objectRotation}deg)`;

if (selectedObject === "cube") {

```
object.classList.add(
  "spawned-cube"
);
```

}

if (selectedObject === "tree") {

```
object.classList.add(
  "spawned-tree"
);

object.innerHTML = `
  <div class="spawned-trunk"></div>
  <div class="spawned-leaves"></div>
`;
```

}

if (selectedObject === "ball") {

```
object.classList.add(
  "spawned-ball"
);
```

}

if (selectedObject === "crate") {

```
object.classList.add(
  "spawned-crate"
);
```

}

if (selectedObject === "water") {

```
object.classList.add(
  "spawned-water"
);
```

}

if (selectedObject === "fire") {

```
object.classList.add(
  "spawned-fire"
);
```

}

if (selectedObject === "wall") {

```
object.classList.add(
  "spawned-wall"
);
```

}

applyObjectSize(
object,
selectedObject
);

object.addEventListener(
"click",
function(event) {

```
  event.stopPropagation();

  if (deleteMode) {

    unregisterPhysicsObject(
      object
    );

    object.remove();

    showToast(
      "Object deleted"
    );

  } else {

    // Give clicked objects a small push.
    pushObject(object);

  }

}
```

);

world.appendChild(object);

registerPhysicsObject(object);

// New physical objects start slightly above
// the ground and fall into place.
if (
selectedObject !== "water" &&
selectedObject !== "fire"
) {

```
const data =
  physicsObjects.get(object);

if (data) {

  data.grounded = false;

  data.velocityZ =
    0;

}
```

}

}

// ==========================================
// OBJECT SIZE
// ==========================================

function applyObjectSize(
object,
type
) {

if (type === "tree") {

```
const scale =
  objectSize / 65;

object.style.transform =
  `scale(${scale}) rotate(${objectRotation}deg)`;

return;
```

}

object.style.width =
objectSize + "px";

object.style.height =
objectSize + "px";

object.style.transform =
`rotate(${objectRotation}deg)`;

}

// ==========================================
// PUSH OBJECT
// ==========================================

function pushObject(object) {

const data =
physicsObjects.get(object);

if (!data) {
return;
}

data.grounded = false;

data.velocityX +=
5 / Math.max(data.weight, 1);

data.velocityZ +=
4 / Math.max(data.weight, 1);

showToast(
"💨 Object pushed"
);

}

// ==========================================
// WORLD CLICK
// ==========================================

world.addEventListener(
"click",
function(event) {

```
if (deleteMode) {
  return;
}

if (
  event.target.closest(
    ".spawned-object"
  )
) {
  return;
}

if (
  event.target.closest(
    "#player"
  )
) {
  return;
}


const rect =
  world.getBoundingClientRect();


const x =
  event.clientX -
  rect.left;


const y =
  event.clientY -
  rect.top;


createObject(
  x,
  y
);
```

}
);

// ==========================================
// WEATHER
// ==========================================

function setWeather(weather) {

currentWeather =
weather;

game.classList.remove(
"weather-sunny",
"weather-cloudy",
"weather-rain",
"weather-fog"
);

game.classList.add(
"weather-" +
weather
);

weatherButtons.forEach(
function(button) {

```
  button.classList.remove(
    "active"
  );


  if (
    button.dataset.weather ===
    weather
  ) {

    button.classList.add(
      "active"
    );

  }

}
```

);

const names = {

```
sunny: "☀️ Sunny",
cloudy: "☁️ Cloudy",
rain: "🌧️ Rain",
fog: "🌫️ Fog"
```

};

weatherStatus.textContent =
names[weather] ||
"☀️ Sunny";

// Rain creates wind.
if (weather === "rain") {

```
physics.wind =
  -0.03;
```

} else {

```
physics.wind =
  0;
```

}

}

// ==========================================
// WEATHER BUTTONS
// ==========================================

weatherButtons.forEach(
function(button) {

```
button.addEventListener(
  "click",
  function() {

    setWeather(
      button.dataset.weather
    );

  }
);
```

}
);

// ==========================================
// DAY / NIGHT
// ==========================================

dayNightButton.addEventListener(
"click",
function() {

```
isNight =
  !isNight;


game.classList.toggle(
  "night",
  isNight
);


if (isNight) {

  timeStatus.textContent =
    "🌙 10:00 PM";

  dayNightButton.textContent =
    "☀️ Day";

} else {

  timeStatus.textContent =
    "☀️ 12:00 PM";

  dayNightButton.textContent =
    "🌙 Night";

}
```

}
);

// ==========================================
// EDITOR
// ==========================================

editorButton.addEventListener(
"click",
function() {

```
editorPanel.classList.toggle(
  "hidden"
);
```

}
);

sizeSlider.addEventListener(
"input",
function() {

```
objectSize =
  Number(
    sizeSlider.value
  );
```

}
);

rotationSlider.addEventListener(
"input",
function() {

```
objectRotation =
  Number(
    rotationSlider.value
  );
```

}
);

applyEditor.addEventListener(
"click",
function() {

```
showToast(
  "🛠️ Editor settings applied"
);
```

}
);

// ==========================================
// SETTINGS
// ==========================================

settingsButton.addEventListener(
"click",
function() {

```
settingsPanel.classList.toggle(
  "hidden"
);
```

}
);

closeSettings.addEventListener(
"click",
function() {

```
settingsPanel.classList.add(
  "hidden"
);
```

}
);

speedSlider.addEventListener(
"input",
function() {

```
player.speed =
  Number(
    speedSlider.value
  );
```

}
);

gridToggle.addEventListener(
"change",
function() {

```
game.classList.toggle(
  "noGrid",
  !gridToggle.checked
);
```

}
);

animationToggle.addEventListener(
"change",
function() {

```
game.classList.toggle(
  "noAnimations",
  !animationToggle.checked
);
```

}
);

// ==========================================
// RESET PLAYER
// ==========================================

resetPlayerButton.addEventListener(
"click",
function() {

```
player.x = 450;
player.y = 300;
player.z = 0;

player.verticalSpeed = 0;
player.onGround = true;

showToast(
  "↩️ Player reset"
);
```

}
);

// ==========================================
// CLEAR WORLD
// ==========================================

clearWorldButton.addEventListener(
"click",
function() {

```
const objects =
  world.querySelectorAll(
    ".spawned-object"
  );


objects.forEach(
  function(object) {

    unregisterPhysicsObject(
      object
    );

    object.remove();

  }
);


showToast(
  "🗑️ World cleared"
);
```

}
);

// ==========================================
// SAVE WORLD
// ==========================================

function saveWorld() {

const objects =
world.querySelectorAll(
".spawned-object"
);

const objectData = [];

objects.forEach(
function(object) {

```
  const physicsData =
    physicsObjects.get(
      object
    );


  objectData.push({

    type:
      object.dataset.type,

    left:
      parseFloat(
        object.style.left
      ) || 0,

    top:
      parseFloat(
        object.style.top
      ) || 0,

    width:
      parseFloat(
        object.style.width
      ) || 65,

    height:
      parseFloat(
        object.style.height
      ) || 65,

    transform:
      object.style.transform,

    velocityX:
      physicsData
        ? physicsData.velocityX
        : 0,

    velocityZ:
      physicsData
        ? physicsData.velocityZ
        : 0,

    grounded:
      physicsData
        ? physicsData.grounded
        : true

  });

}
```

);

const data = {

```
player: {
  x: player.x,
  y: player.y,
  z: player.z
},

weather:
  currentWeather,

night:
  isNight,

objects:
  objectData
```

};

localStorage.setItem(
savedWorldName,
JSON.stringify(data)
);

showToast(
"💾 World saved!"
);

}

// ==========================================
// LOAD WORLD
// ==========================================

function loadWorld() {

const saved =
localStorage.getItem(
savedWorldName
);

if (!saved) {

```
showToast(
  "No saved world found"
);

return;
```

}

let data;

try {

```
data =
  JSON.parse(saved);
```

} catch (error) {

```
showToast(
  "Save data is damaged"
);

return;
```

}

const existing =
world.querySelectorAll(
".spawned-object"
);

existing.forEach(
function(object) {

```
  unregisterPhysicsObject(
    object
  );

  object.remove();

}
```

);

if (data.player) {

```
player.x =
  data.player.x;

player.y =
  data.player.y;

player.z =
  data.player.z || 0;

player.onGround =
  player.z === 0;
```

}

if (data.weather) {

```
setWeather(
  data.weather
);
```

}

if (data.night !== undefined) {

```
isNight =
  data.night;

game.classList.toggle(
  "night",
  isNight
);


if (isNight) {

  timeStatus.textContent =
    "🌙 10:00 PM";

  dayNightButton.textContent =
    "☀️ Day";

} else {

  timeStatus.textContent =
    "☀️ 12:00 PM";

  dayNightButton.textContent =
    "🌙 Night";

}
```

}

if (
Array.isArray(
data.objects
)
) {

```
data.objects.forEach(
  function(savedObject) {

    selectedObject =
      savedObject.type;

    objectSize =
      savedObject.width ||
      65;

    objectRotation = 0;


    const object =
      document.createElement(
        "div"
      );


    object.classList.add(
      "spawned-object"
    );


    object.dataset.type =
      savedObject.type;


    object.style.left =
      savedObject.left + "px";


    object.style.top =
      savedObject.top + "px";


    object.style.width =
      savedObject.width + "px";


    object.style.height =
      savedObject.height + "px";


    object.style.transform =
      savedObject.transform ||
      "";


    if (
      savedObject.type === "cube"
    ) {

      object.classList.add(
        "spawned-cube"
      );

    }


    if (
      savedObject.type === "tree"
    ) {

      object.classList.add(
        "spawned-tree"
      );

      object.innerHTML = `
        <div class="spawned-trunk"></div>
        <div class="spawned-leaves"></div>
      `;

    }


    if (
      savedObject.type === "ball"
    ) {

      object.classList.add(
        "spawned-ball"
      );

    }


    if (
      savedObject.type === "crate"
    ) {

      object.classList.add(
        "spawned-crate"
      );

    }


    if (
      savedObject.type === "water"
    ) {

      object.classList.add(
        "spawned-water"
      );

    }


    if (
      savedObject.type === "fire"
    ) {

      object.classList.add(
        "spawned-fire"
      );

    }


    if (
      savedObject.type === "wall"
    ) {

      object.classList.add(
        "spawned-wall"
      );

    }


    object.addEventListener(
      "click",
      function(event) {

        event.stopPropagation();


        if (deleteMode) {

          unregisterPhysicsObject(
            object
          );

          object.remove();

          showToast(
            "Object deleted"
          );

        } else {

          pushObject(
            object
          );

        }

      }
    );


    world.appendChild(
      object
    );


    registerPhysicsObject(
      object
    );


    const physicsData =
      physicsObjects.get(
        object
      );


    if (physicsData) {

      physicsData.velocityX =
        savedObject.velocityX ||
        0;

      physicsData.velocityZ =
        savedObject.velocityZ ||
        0;

      physicsData.grounded =
        savedObject.grounded !==
        false;

    }

  }
);
```

}

showToast(
"📂 World loaded!"
);

}

// ==========================================
// SAVE / LOAD
// ==========================================

saveWorldButton.addEventListener(
"click",
saveWorld
);

loadWorldButton.addEventListener(
"click",
loadWorld
);

// ==========================================
// MOBILE CONTROLS
// ==========================================

const controlButtons =
document.querySelectorAll(
"#controls [data-key]"
);

controlButtons.forEach(
function(button) {

```
const key =
  button.dataset.key;


button.addEventListener(
  "mousedown",
  function() {

    keys[key] = true;

  }
);


button.addEventListener(
  "mouseup",
  function() {

    keys[key] = false;

  }
);


button.addEventListener(
  "mouseleave",
  function() {

    keys[key] = false;

  }
);


button.addEventListener(
  "touchstart",
  function(event) {

    event.preventDefault();

    keys[key] = true;

  }
);


button.addEventListener(
  "touchend",
  function(event) {

    event.preventDefault();

    keys[key] = false;

  }
);
```

}
);

document
.getElementById("jumpButton")
.addEventListener(
"click",
jump
);

// ==========================================
// MOUSE LOOK
// ==========================================

game.addEventListener(
"mousemove",
function(event) {

```
const centerX =
  window.innerWidth / 2;

const centerY =
  window.innerHeight / 2;


const lookX =
  (event.clientX - centerX) *
  0.02;


const lookY =
  (event.clientY - centerY) *
  0.01;


game.style.setProperty(
  "--look-x",
  lookX + "px"
);


game.style.setProperty(
  "--look-y",
  lookY + "px"
);
```

}
);

// ==========================================
// INITIAL WEATHER
// ==========================================

setWeather("sunny");

// ==========================================
// INITIAL PLAYER
// ==========================================

updatePlayer();

// ==========================================
// PHYSICS LOOP
// ==========================================

function physicsLoop() {

updatePhysics();

checkObjectCollisions();

requestAnimationFrame(
physicsLoop
);

}

// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

updatePlayer();

requestAnimationFrame(
gameLoop
);

}

physicsLoop();
gameLoop();

console.log(
"Sandbox Simulator — Advanced Physics loaded."
);
