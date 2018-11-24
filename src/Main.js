import * as PIXI from 'pixi.js';
import * as PixiCulling from './PixiCulling';
const Stats = require('stats.js');


//Settings
const totalBunnies = 1000;
const totalMovingBunnies = 100;
const targetFPS = 1000 / 60; //60fps
const bunnySpeed = 10;

//PIXI
PixiCulling.renderArea.width = 100;
PixiCulling.renderArea.height = 100;
PixiCulling.cellSize.x = 50;
PixiCulling.cellSize.y = 50;

const app = new PIXI.Application({
    autoResize: true
});
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

    // position the bunnies evenly over the full screen
    for (let i = 0; i < num; i++) {
        const iPerc = (i + 1) / num;
        for (let j = 0; j < num; j++) {
            const jPerc = (j + 1) / num;
            const bunny = new PIXI.Sprite(PIXI.loader.resources.bunny.texture);
            bunny.x = app.renderer.width * iPerc;
            bunny.y = app.renderer.height * jPerc;
            bunny.pivot.set(bunny.width / 2, bunny.height / 2);
            bunny.filters = [new PIXI.filters.BlurFilter()];
            container.addChild(bunny);
        }
    }
    // select bunnies that will move
    for (let i = 0; i < totalMovingBunnies; i++) {
        const randomBunnyIndex = Math.floor(container.children.length * Math.random())
        const targetBunny = container.getChildAt(randomBunnyIndex);
        if (movingBunnies.includes(targetBunny)) {
            i--;
            continue;
        }
        movingBunnies.push(targetBunny);
    }
    // set up listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keyup', handleKeyUp);

    PixiCulling.init(container);

    render();


    var text = new PIXI.Text(`${totalBunnies} Bunnies, of which ${totalMovingBunnies} moving\nMove mouse to reposition the render view\nPress Space to enable/disable culling, press D to enable/disable debug drawing`, {fontSize: 12, fill : 0xffffff});
    text.x = 100;
    text.y = 100;
    app.stage.addChild(text);
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
const handleMouseMove = (event) => {
    //move the viewable area
    PixiCulling.renderArea.x = event.clientX - PixiCulling.renderArea.width / 2;
    PixiCulling.renderArea.y = event.clientY - PixiCulling.renderArea.height / 2;
}
const handleKeyUp = (event) => {
    if(event.keyCode == 32){
        PixiCulling.toggleEnabled();
    }else if(event.keyCode == 68){
        PixiCulling.toggleDebug();
    }
}

const update = () => {
    stats.begin();
    moveBunnies();
    PixiCulling.update();
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


//handle resize
window.addEventListener('resize', resize);
const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
resize();