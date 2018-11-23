import * as PIXI from 'pixi.js';
import * as PIXICulling from './PIXICulling';
const Stats = require('stats.js');


//Settings
const totalBunnies = 50000;
const totalMovingBunnies = 100;
const targetFPS = 1000 / 60; //60fps
const bunnySpeed = 50;
PIXICulling.renderArea.width = 100;
PIXICulling.renderArea.height = 100;
PIXICulling.renderArea.height = 100;
PIXICulling.cellSize.x = 50;
PIXICulling.cellSize.y = 50;

const app = new PIXI.Application();
app.stop(); // do custom render step
document.body.appendChild(app.view);

const stats = new Stats();
document.body.appendChild(stats.dom);

const container = new PIXI.Graphics();
app.stage.addChild(container);

let movingBunnies = [];

PIXI.loader.add('bunny', './assets/bunny.png').load((loader, resources) => {
    init();
});


const init = () => {
    const num = Math.sqrt(totalBunnies)

    for (let i = 0; i < num; i++) {
        const iPerc = (i + 1) / num;
        for (let j = 0; j < num; j++) {
            const jPerc = (j + 1) / num;
            const bunny = new PIXI.Sprite(PIXI.loader.resources.bunny.texture);
            bunny.x = app.renderer.width * iPerc
            bunny.y = app.renderer.height * jPerc
            bunny.pivot.set(bunny.width / 2, bunny.height / 2);
            container.addChild(bunny);
        }
    }
    for (let i = 0; i < totalMovingBunnies; i++) {
        const randomBunnyIndex = Math.floor(container.children.length * Math.random())
        const targetBunny = container.getChildAt(randomBunnyIndex);
        if (movingBunnies.includes(targetBunny)) {
            i--;
            continue;
        }
        movingBunnies.push(targetBunny);
    }
    document.addEventListener('mousemove', updateRenderView);
    PIXICulling.init(container);
    render();
}
const moveBunnies = () => {
    movingBunnies.map((bunny) => {
        if (bunny.xmov == undefined) {
            bunny.xmov = Math.random() * bunnySpeed;
            bunny.ymov = bunnySpeed - bunny.xmov;
            if (Math.random() > .5) bunny.xmov *= -1;
            if (Math.random() > .5) bunny.ymov *= -1;
        }
        bunny.x += bunny.xmov;
        bunny.y += bunny.ymov;

        if (bunny.x > app.renderer.width) {
            bunny.x = app.renderer.width;
            bunny.xmov *= -1
        } else if (bunny.x < 0) {
            bunny.x = 0;
            bunny.xmov *= -1
        }

        if (bunny.y > app.renderer.height) {
            bunny.y = app.renderer.height;
            bunny.ymov *= -1
        } else if (bunny.y < 0) {
            bunny.y = 0;
            bunny.ymov *= -1
        }
    });
}
const updateRenderView = (event)=> {
    PIXICulling.renderArea.x = event.clientX-PIXICulling.renderArea.width/2;
    PIXICulling.renderArea.y = event.clientY-PIXICulling.renderArea.height/2;
}

const update = () => {
    stats.begin();
    moveBunnies();
    PIXICulling.update();
    app.render();
    stats.end();
}

let then, now;
const render = (newtime) => {
    if (!then) then = window.performance.now();
    requestAnimationFrame(render);
    now = newtime;
    const elapsed = now - then;
    if (elapsed > targetFPS) {
        then = now - (elapsed % targetFPS);
        update();
    }
}