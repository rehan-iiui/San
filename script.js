// ==========================================
// SANDBOX SIMULATOR
// WEATHER + PLAYER + OBJECT SYSTEM
// ==========================================

const game = document.getElementById("game");
const world = document.getElementById("world");
const coordinates = document.getElementById("coordinates");

const tools = document.querySelectorAll(".tool");
const deleteModeButton = document.getElementById("deleteMode");

const weatherButtons =
  document.querySelectorAll(".weatherButton");

const dayNightButton =
  document.getElementById("dayNightButton");

const weatherStatus =
  document.getElementById("weatherStatus");

const timeStatus =
  document.getElementById("timeStatus");


// ==========================================
// PLAYER
// ==========================================

let player = {
  x: 450,
  y: 300,
  z: 0,

  speed: 4,

  jumpPower: 12,
  verticalSpeed: 0,

  onGround: true
};


// ==========================================
// CONTROLS
// ==========================================

const keys = {};

let selectedObject = "cube";
let deleteMode = false;

let isNight = false;

let currentWeather = "sunny";


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

  if (keys["w"]) {
    player.y -= player.speed;
  }

  if (keys["s"]) {
    player.y += player.speed;
  }

  if (keys["a"]) {
    player.x -= player.speed;
  }

  if (keys["d"]) {
    player.x += player.speed;
  }


  // World boundaries

  player.x =
    Math.max(
      50,
      Math.min(850, player.x)
    );

  player.y =
    Math.max(
      120,
      Math.min(500, player.y)
    );


  // Gravity

  if (!player.onGround) {

    player.verticalSpeed -= 0.6;

    player.z += player.verticalSpeed;


    if (player.z <= 0) {

      player.z = 0;

      player.verticalSpeed = 0;

      player.onGround = true;

    }

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
    `${player.x}px`;

  playerElement.style.top =
    `${player.y - player.z}px`;

}


// ==========================================
// JUMP
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
// OBJECT SELECTION
// ==========================================

tools.forEach(function(tool) {

  tool.addEventListener("click", function() {

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

  });

});


// ==========================================
// DELETE MODE
// ==========================================

deleteModeButton.addEventListener(
  "click",
  function() {

    deleteMode =
      !deleteMode;


    deleteModeButton.classList.toggle(
      "active",
      deleteMode
    );


    tools.forEach(function(tool) {

      tool.classList.remove("active");

    });

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
    `${x}px`;

  object.style.top =
    `${y}px`;


  // CUBE

  if (selectedObject === "cube") {

    object.classList.add(
      "spawned-cube"
    );

  }


  // TREE

  if (selectedObject === "tree") {

    object.classList.add(
      "spawned-tree"
    );


    object.innerHTML = `
      <div class="spawned-trunk"></div>
      <div class="spawned-leaves"></div>
    `;

  }


  // BALL

  if (selectedObject === "ball") {

    object.classList.add(
      "spawned-ball"
    );

  }


  // CRATE

  if (selectedObject === "crate") {

    object.classList.add(
      "spawned-crate"
    );

  }


  object.addEventListener(
    "click",
    function(event) {

      event.stopPropagation();


      if (deleteMode) {

        object.remove();

      }

    }
  );


  world.appendChild(object);

}


// ==========================================
// WORLD CLICK
// ==========================================

world.addEventListener(
  "click",
  function(event) {

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


    const rect =
      world.getBoundingClientRect();


    const x =
      event.clientX -
      rect.left;


    const y =
      event.clientY -
      rect.top;


    createObject(x, y);

  }
);


// ==========================================
// WEATHER
// ==========================================

function setWeather(weather) {

  currentWeather = weather;


  game.classList.remove(
    "weather-sunny",
    "weather-cloudy",
    "weather-rain",
    "weather-fog"
  );


  game.classList.add(
    `weather-${weather}`
  );


  weatherButtons.forEach(
    function(button) {

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
  );


  const names = {

    sunny: "☀️ Sunny",

    cloudy: "☁️ Cloudy",

    rain: "🌧️ Rain",

    fog: "🌫️ Fog"

  };


  weatherStatus.textContent =
    names[weather] || "☀️ Sunny";

}


// ==========================================
// WEATHER BUTTONS
// ==========================================

weatherButtons.forEach(
  function(button) {

    button.addEventListener(
      "click",
      function() {

        setWeather(
          button.dataset.weather
        );

      }
    );

  }
);


// ==========================================
// DAY / NIGHT
// ==========================================

function toggleDayNight() {

  isNight = !isNight;


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

}


dayNightButton.addEventListener(
  "click",
  toggleDayNight
);


// ==========================================
// MOUSE
// ==========================================

game.addEventListener(
  "mousemove",
  function(event) {

    const centerX =
      window.innerWidth / 2;

    const centerY =
      window.innerHeight / 2;


    const lookX =
      (event.clientX - centerX) * 0.02;

    const lookY =
      (event.clientY - centerY) * 0.01;


    game.style.setProperty(
      "--look-x",
      `${lookX}px`
    );

    game.style.setProperty(
      "--look-y",
      `${lookY}px`
    );

  }
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

  }
);


const jumpButton =
  document.getElementById(
    "jumpButton"
  );


jumpButton.addEventListener(
  "click",
  function() {

    jump();

  }
);


// ==========================================
// SPAWNED OBJECT STYLES
// ==========================================

const extraStyles =
  document.createElement("style");


extraStyles.textContent = `

.spawned-object {
  position: absolute;
  z-index: 10;
  cursor: pointer;
  transform: translateZ(0);
}

.spawned-cube {
  width: 65px;
  height: 65px;
  background: #d89b52;
  border: 3px solid #9b652c;
  box-shadow:
    8px 10px 0 rgba(0,0,0,0.2);
}

.spawned-ball {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background: #e9e9e9;
  border: 3px solid #777;
  box-shadow:
    7px 9px 0 rgba(0,0,0,0.2);
}

.spawned-crate {
  width: 70px;
  height: 70px;
  background:
    linear-gradient(
      45deg,
      transparent 43%,
      #71431d 44%,
      #71431d 50%,
      transparent 51%
    ),
    linear-gradient(
      -45deg,
      transparent 43%,
      #71431d 44%,
      #71431d 50%,
      transparent 51%
    ),
    #b87938;
  border: 4px solid #71431d;
  box-shadow:
    8px 10px 0 rgba(0,0,0,0.2);
}

.spawned-tree {
  width: 70px;
  height: 140px;
}

.spawned-trunk {
  position: absolute;
  bottom: 0;
  left: 28px;
  width: 20px;
  height: 65px;
  background: #79502f;
  border: 2px solid #5d3a20;
}

.spawned-leaves {
  position: absolute;
  top: 0;
  left: 0;
  width: 70px;
  height: 80px;
  background: #25833b;
  border-radius: 50%;
  border: 3px solid #17652b;
  box-shadow:
    0 10px 0 #1c7132,
    8px 4px 0 #2e9144,
    -8px 5px 0 #2e9144;
}

`;


document.head.appendChild(
  extraStyles
);


// ==========================================
// INITIAL WEATHER
// ==========================================

setWeather("sunny");


// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

  updatePlayer();

  requestAnimationFrame(
    gameLoop
  );

}


// ==========================================
// START
// ==========================================

updatePlayer();

gameLoop();

console.log(
  "Sandbox Simulator loaded successfully."
);
