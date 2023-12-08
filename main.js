import { Bodies, Body, Collision, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS_BASE, FRUITS_HLW } from "./fruits";

let THEME = "base"; // {base, halloween}
// let THEME = "halloween"; // {base, halloween}
let FRUITS = FRUITS_BASE;

switch (THEME) {
    case "halloween":
        FRUITS = FRUITS_HLW;
        break;
    default:
        FRUITS = FRUITS_BASE;
}

const engine = Engine.create();
const render = Render.create({
    engine,
    element: document.body,
    options: {
        wireframes: false,
        background: "#F7F4C8",
        width: 620,
        height: 850,
    }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
    isStatic: true,
    render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
    name: "topLine",
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#E6B143" }
});

World.add(world, [leftWall, rightWall, ground, topLine]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disabledAction = false;
let interval = null;

function addFruit() {
    const index = Math.floor(Math.random() * 5);
    const fruit = FRUITS[index];

    const body = Bodies.circle(300, 50, fruit.radius, {
        index: index,
        isSleeping: true,
        render: {
            sprite: { texture: `${fruit.name}.png` }
        },
        restitution: 0.2,
    });

    currentBody = body;
    currentFruit = fruit;

    World.add(world, body);
}

window.onkeydown = (event) => {
    if (disabledAction) {
        return;
    }

    switch (event.code) {
        case "ArrowLeft":
            if (interval)
                return;

            interval = setInterval(() => {
                if (currentBody.position.x - currentFruit.radius > 30)
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x - 1,
                        y: currentBody.position.y,
                    });
            }, 5);
            break;

        case "ArrowRight":
            if (interval)
                return;

            interval = setInterval(() => {
                if (currentBody.position.x + currentFruit.radius < 590)
                    Body.setPosition(currentBody, {
                        x: currentBody.position.x + 1,
                        y: currentBody.position.y,
                    });
            }, 5);
            break;

        case "Space":
            currentBody.isSleeping = false;
            disabledAction = true;

            setTimeout(() => {
                addFruit();
                disabledAction = false;
            }, 1000);
            break;
    }
}

window.onkeyup = (event) => {
    switch (event.code) {
        case "ArrowLeft":
        case "ArrowRight":
            clearInterval(interval);
            interval = null;
    }
}

Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
        if (collision.bodyA.index === collision.bodyB.index) {
            const _index = collision.bodyA.index;

            if (_index === FRUITS.length - 1) {
                return;
            }

            World.remove(world, [collision.bodyA, collision.bodyB]);

            const _fruit = FRUITS[_index + 1];

            const _body = Bodies.circle(
                collision.collision.supports[0].x,
                collision.collision.supports[0].y,
                _fruit.radius,
                {
                    render: {
                        sprite: { texture: `${_fruit.name}.png` }
                    },
                    index: _index + 1,
                }
            );

            World.add(world, _body);
        }

        if ( !disabledAction &&
            (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
            alert("GAME OVER");
        }
    });
});

addFruit();
