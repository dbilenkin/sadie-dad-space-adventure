// GAME GLOBALS
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasWidth = 800;
const canvasHeight = 600;
const scoreHeight = 40;
const healthHight = 80;

const keys = [];

let tickCount = 0;
let gameStarted = false;

// SHOP GLOBALS
let shopShown = false;
let shopUpgrades;

const shopImage = new Image();
shopImage.src = 'images/shop.png';
let shop = { show: false, width: 100, height: 100, x: 1000, y: 1000, speedx: -1.5 };

// ROCKET GLOBALS
let rocketSpeed = -1.5;
const rocketWidth = 66;
const rocketHeight = 46;

const rocketImage = new Image();
rocketImage.src = 'images/rocket.png';
const rocket = { x: 0, y: 0, starSoundI: 0, explosionSoundI: 0 };

let shots = [];

// STAR GLOBALS
let starSpeed = -1.5;
const starWidth = 25;
const starHeight = 25;
const starImage = new Image();
starImage.src = 'images/star.png';

const starSounds = [1, 2, 3, 4, 5].map(s => new Audio('sounds/starCollected.m4a'));

let numStars = 20;
let stars = [];

// ASTEROID GLOBALS
let asteroidSpeed = -1;
let asteroidSize = 80;

const asteroidImage = new Image();
asteroidImage.src = 'images/asteroid.png';

const explosionImage = new Image();
explosionImage.src = 'images/explosion.png';

const explosionSounds = [1, 2, 3, 4, 5].map(s => new Audio('sounds/explosion.m4a'));

let numAsteroids = 3;
let asteroids = [];

// UTILITY FUNCTIONS
function objectsIntersect(a, b) {
  const aLeftOfB = a.x + a.width < b.x;
  const aRightOfB = a.x > b.x + b.width;
  const aAboveB = a.y + a.height < b.y;
  const aBelowB = a.y > b.y + b.height;

  return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
}

function getRandomY(objectHeight) {
  return scoreHeight + objectHeight + Math.random() * (canvasHeight - objectHeight - scoreHeight - healthHight);
}

function getRandomSpeed(speed) {
  return speed * .8 + Math.random() * speed * .4;
}

function getRandomSize(size) {
  return size / 2 + Math.random() * size;
}

function getAsteroidBox(asteroid) {
  return {
    x: asteroid.x - asteroid.width / 2,
    y: asteroid.y - asteroid.height / 2,
    width: asteroid.width,
    height: asteroid.height,
    exploded: asteroid.exploded
  }
}

// INIT FUNCTIONS
function initShop() {
  shopUpgrades = [
    {
      name: 'boostedEngine',
      description: 'Boosted Engine',
      cost: 30,
      speedx: 0,
      speedy: 2,
      health: 100
    },
    {
      name: 'pinkRocket',
      description: 'Pink Rocket',
      cost: 50,
      speedx: 0,
      speedy: 2,
      health: 200,
    },
    {
      name: 'ufo',
      description: 'UFO',
      cost: 100,
      speedx: 2,
      speedy: 2,
      health: 200,
    },
    {
      name: 'laserRocket',
      description: 'Laser Rocket',
      cost: 200,
      speedx: 2,
      speedy: 3,
      health: 200,
    }
  ]
}

function initRocket() {
  rocketImage.src = 'images/rocket.png';
  rocket.width = rocketWidth;
  rocket.height = rocketHeight;
  rocket.x = 50;
  rocket.y = (canvasHeight - rocketHeight) / 2;
  rocket.speedy = 1;
  rocket.speedx = 0;
  rocket.starCount = 0;
  rocket.asteroidCount = 0;
  rocket.score = 0;
  rocket.starScore = 0;
  rocket.health = 100;
}

function createStar(i) {
  const x = i * (canvasWidth / numStars);
  const y = getRandomY(starHeight);
  const width = starWidth;
  const height = starHeight;
  const speedx = starSpeed;
  const show = true;
  const star = { x, y, width, height, speedx, show };
  return star;
}

function initStars() {
  for (let i = 0; i < numStars; i++) {
    stars.push(createStar(i));
  }
}

function createAsteroid(i) {
  const x = (i + 1) * (canvasWidth / (numAsteroids - 1));
  const y = getRandomY(asteroidSize - 20);

  const size = getRandomSize(asteroidSize);
  const width = size;
  const height = size;

  const speedx = getRandomSpeed(asteroidSpeed);
  console.log(speedx);
  const dir = 0;
  const show = true;
  const asteroid = { x, y, width, height, speedx, dir, show };
  return asteroid;
}

function initAsteroids() {
  for (let i = 0; i < numAsteroids; i++) {
    asteroids.push(createAsteroid(i));
  }
}

// ACTION FUNCTIONS

function moveRocket() {
  if (keys['ArrowUp']) {
    if (rocket.y > 0 + scoreHeight) {
      rocket.y -= rocket.speedy;
    }
  } else if (keys['ArrowDown']) {
    if (rocket.y < canvasHeight - rocketHeight) {
      rocket.y += rocket.speedy;
    }
  } else if (keys['ArrowLeft']) {
    if (rocket.x > 20) {
      rocket.x -= rocket.speedx;
    }
  } else if (keys['ArrowRight']) {
    if (rocket.x < canvasWidth - 200) {
      rocket.x += rocket.speedx;
    }
  }
}

function shoot() {
  const shot = {
    x: rocket.x + rocket.width,
    y: rocket.y + rocket.height / 2,
    width: 10,
    height: 5,
    speedx: 1,
    show: true
  }
  shots.push(shot);
}

// DRAW FUNCTIONS

function drawRocket() {
  ctx.drawImage(rocketImage, rocket.x, rocket.y);
}

function drawShots() {
  const shotsCopy = [...shots];

  for (const [i, shot] of shotsCopy.entries()) {
    if (shot.x > canvasWidth) {
      shots.splice(i, 1);
    }
    shot.x += shot.speedx;
    let { x, y, width, height } = shot;
    ctx.fillStyle = '#ffffff';
    if (shot.show) {
      ctx.fillRect(x, y, width, height);
    }

    for (const asteroid of asteroids) {
      if (asteroid.show && shot.show && objectsIntersect(getAsteroidBox(asteroid), shot)) {
        shots.splice(i, 1);
        shot.show = false;
        asteroid.show = false;
        asteroid.exploded = 12;
      }
    }

    if (shop.show && shot.show && objectsIntersect(shot, shop)) {
      shots.splice(i, 1);
      shot.show = false;
      shop.show = false;
      shop.exploded = 12;
    }
    
  }
}

function drawStars() {
  let starTickCount = 0;

  for (const star of stars) {
    star.x += star.speedx;
    if (objectsIntersect(rocket, star)) {
      starTickCount++;
      if (starTickCount > rocket.starCount) {
        rocket.starScore++;
        rocket.starCount++;

        rocket.starSoundI = (rocket.starSoundI + 1) % starSounds.length;
        starSounds[rocket.starSoundI].play();
      }
      star.show = false;
    }

    if (star.x < 0 - starWidth) {
      star.show = true;
      star.x = canvasWidth + (canvasWidth / numStars);
      star.y = getRandomY(starHeight);
    }

    if (star.show) {
      ctx.drawImage(starImage, star.x, star.y);
    }
  }

  rocket.starCount = starTickCount; //reset starCount to stars touching in this tick
}

function explosion(objectBox, object) {
  const frame = 12 - object.exploded;

  if (frame === 0) {
    rocket.explosionSoundI = (rocket.explosionSoundI + 1) % explosionSounds.length;
    explosionSounds[rocket.explosionSoundI].play();
  }
  const sx = (frame % 5) * 192;
  const sy = Math.floor(frame / 5) * 192;
  // console.log(sx, sy);
  const { x, y, width, height } = objectBox;
  ctx.drawImage(explosionImage, sx, sy, 192, 192, x, y, width, height);
  if (tickCount % 5 === 0) {
    object.exploded--;
  }
}

function drawAsteroids() {
  let asteroidTickCount = 0;

  for (const asteroid of asteroids) {
    asteroid.x += asteroid.speedx;

    if (asteroid.exploded > 0) {
      explosion(getAsteroidBox(asteroid), asteroid);
    }

    if (asteroid.show && objectsIntersect(rocket, getAsteroidBox(asteroid))) {
      asteroidTickCount++;
      if (asteroidTickCount > rocket.asteroidCount) {
        rocket.health -= 10;
        rocket.asteroidCount++;
        asteroid.exploded = 12;
      }
      asteroid.show = false;
    }

    if (asteroid.x < 0 - asteroid.width) {
      asteroid.show = true;
      asteroid.speedx = getRandomSpeed(asteroidSpeed);
      asteroid.x = canvasWidth + asteroid.width;
      asteroid.y = getRandomY(asteroid.height - 20);
    }

    if (asteroid.show) {
      asteroid.dir += .01;
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.dir);
      ctx.drawImage(
        asteroidImage,
        -asteroid.width / 2,
        -asteroid.height / 2,
        asteroid.width,
        asteroid.height
      );
      ctx.restore();
    }
  }

  rocket.asteroidCount = asteroidTickCount; //reset starCount to stars touching in this tick
}

function addShop() {
  if (!shop.show && tickCount % 100 === 0 && Math.random() > .8) {
    shop.show = true;
    shop.x = canvasWidth + 100;
    shop.y = getRandomY(shop.height);
  }
}

function drawShop() {
  shop.x += shop.speedx;
  if (shop.show) {
    ctx.drawImage(shopImage, shop.x, shop.y);

    if (objectsIntersect(rocket, shop)) {
      shop.show = false;
      showShop();
    }
  }

  if (shop.exploded > 0) {
    explosion(shop, shop);
  }

  if (shop.x < 0 - shop.width) {
    shop.show = false;
  }
}

function drawStarScore() {
  ctx.font = '30px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#00ff00';
  ctx.fillText('Score: ' + rocket.score, 20, 40);

  ctx.fillStyle = 'yellow';
  ctx.fillText('Stars: ' + rocket.starScore, canvasWidth - 140, 40);
}

function drawHealth() {
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(0, canvasHeight - 30, rocket.health * 2, 15);
}

function speedUpAsteroids() {
  asteroidSpeed -= .2;
}

function addAsteroid() {
  numAsteroids++;
  asteroids.push(createAsteroid(numAsteroids));
}

function starShower() {
  for (let i = 0; i < rocket.score; i++) {
    stars.push(createStar(i));
  }
}

function tick() {
  if (!gameStarted) return;

  if (tickCount % 100 === 0) {
    rocket.score++;
    if (rocket.score === 50) {
      // starShower();
    }
  }

  if (asteroidSpeed > -2 && tickCount % 1000 === 0) {
    speedUpAsteroids();
  }

  if (numAsteroids < rocket.score / 20) {
    addAsteroid();
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  tickCount++;

  moveRocket();
  addShop();

  drawHealth();
  drawStarScore();

  drawRocket();
  drawStars();
  drawAsteroids();
  drawShots();
  drawShop();

  if (rocket.health <= 0) {
    gameOver();
  }

  setTimeout(tick, 0);
}

// GAME CONTROLS
function continueGame() {
  if (gameStarted) return;

  gameStarted = true;
  shopShown = false;

  tick();
}

function start() {
  if (gameStarted) return;

  gameStarted = true;
  shopShown = false;

  stars = [];
  asteroids = [];

  initShop();
  initRocket();
  initStars();
  initAsteroids();

  tick();
}

function showMenu() {
  gameStarted = false;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const titleImage = new Image();
  titleImage.src = 'images/title.png';
  titleImage.onload = () => {
    ctx.drawImage(titleImage, 150, 100, 500, 150);
  };

  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#f7bfbe';
  ctx.textAlign = 'center';
  ctx.fillText('Press S to start.', canvasWidth / 2, 400);
  ctx.fillText('Once in game, press Q to quit.', canvasWidth / 2, 450);
}

showMenu();

function gameOver() {
  gameStarted = false;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const gameOverImage = new Image();
  gameOverImage.src = 'images/gameover.png';
  gameOverImage.onload = () => {
    ctx.drawImage(gameOverImage, 150, 100, 500, 150);
  };

  ctx.font = '40px sans-serif';
  ctx.fillStyle = '#f7bfbe';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#00ff00';
  ctx.fillText('Score: ' + rocket.score, canvasWidth / 2, 300);

  ctx.fillStyle = 'yellow';
  ctx.fillText('Stars: ' + rocket.starScore, canvasWidth / 2, 400);

}

function equipUpgrade(upgradeIndex) {
  const upgrade = shopUpgrades[upgradeIndex];
  rocketImage.src = `images/${upgrade.name}.png`;
  shopUpgrades.forEach(upgrade => upgrade.equipped = false);
  upgrade.equipped = true;

  rocket.speedx = upgrade.speedx;
  rocket.speedy = upgrade.speedy;
  if (!upgrade.used) { //if this is the first time using the upgrade, boost the health
    rocket.health = upgrade.health;
  }
  upgrade.used = true;
}

function purchaseOrEquip(upgradeIndex) {
  const upgrade = shopUpgrades[upgradeIndex];
  if (upgrade.purchased) {
    equipUpgrade(upgradeIndex);
  } else if (rocket.starScore >= upgrade.cost) {
    rocket.starScore -= upgrade.cost;
    upgrade.purchased = true;
    equipUpgrade(upgradeIndex);
  }

  if (shopShown) {
    showShop();
  }

}

function showShop() {
  gameStarted = false;
  shopShown = true;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.textAlign = 'left';
  ctx.font = '30px sans-serif';
  ctx.fillStyle = 'yellow';
  ctx.fillText('Stars: ' + rocket.starScore, canvasWidth - 140, 40);

  ctx.textAlign = 'center';
  ctx.font = '48px sans-serif';
  ctx.fillStyle = '#8904c2';
  ctx.fillText('Shop', canvasWidth / 2, 60);

  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#8904c2';
  ctx.fillText('Type the number', canvasWidth / 2, 400);
  ctx.fillText('corresponding to an', canvasWidth / 2, 435);
  ctx.fillText('upgrade to purchase or', canvasWidth / 2, 470);
  ctx.fillText('equip it.', canvasWidth / 2, 505);

  for (const [i, upgrade] of shopUpgrades.entries()) {

    if (upgrade.equipped) {
      ctx.fillStyle = '#00ff00';
    } else {
      ctx.fillStyle = '#8904c2';
    }

    ctx.fillRect(30 + i * (canvasWidth / 4), 100, 140, 180);
    ctx.fillStyle = '#d400e3';
    ctx.fillRect(36 + i * (canvasWidth / 4), 106, 128, 168);

    const image = new Image();
    image.src = `images/${upgrade.name}.png`;
    image.onload = () => {
      ctx.drawImage(image, 58 + i * (canvasWidth / 4), 130);
    };

    ctx.fillStyle = '#000000';
    ctx.font = '20px sans-serif';

    const descriptions = upgrade.description.split(" ");
    if (descriptions.length === 2) {
      for (const [j, description] of descriptions.entries()) {
        ctx.fillText(description, 100 + i * (canvasWidth / 4), 210 + j * 22);
      }
    } else {
      ctx.fillText(upgrade.description, 100 + i * (canvasWidth / 4), 220);
    }

    const costText = upgrade.purchased ? 'PURCHASED' : `${upgrade.cost} Stars`
    ctx.fillText(costText, 100 + i * (canvasWidth / 4), 260);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#f7bfbe';
    ctx.textAlign = 'center';
    ctx.fillText(i + 1, 100 + i * (canvasWidth / 4), 330);
  }

  ctx.font = '36px sans-serif';
  ctx.fillStyle = '#f7bfbe';
  ctx.textAlign = 'center';
  ctx.fillText('Press S to continue.', canvasWidth / 2, 560);
}

// KEY EVENTS
document.body.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
document.body.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  if (shopShown) {
    if ('1234'.indexOf(e.key) !== -1) {
      purchaseOrEquip(parseInt(e.key) - 1);
    } else if (e.key === 's') {
      continueGame();
    }
  } else if (gameStarted) {
    if (e.key === 'q') {
      showMenu();
    } else if (e.key === ' ') {
      shoot();
    }
  } else {
    if (e.key === 's') {
      start();
    }
  }
});
