# PixiCulling
A cell based culling engine for Pixi

# Example
[https://eriksom.github.io/PixiCulling/]

# Notes
* Graphics need to have center at 0,0
* Graphics are initialized once, if a graphic changes in shape or form during runtime you need to update the graphic size info, you can use PixiCulling.getSizeInfoForGraphic(graphic) for this
* For debugging the container need to be a graphic

```javascript
//Example scripts, also feel free to look at the demo
import * as PixiCulling from './PixiCulling';
//render area sets the viewport that will be used to cull things, you can also change these during runtime
PixiCulling.renderArea.x = 100;
PixiCulling.renderArea.y = 100;
PixiCulling.renderArea.width = 200;
PixiCulling.renderArea.height = 300;

//here you can set the precision of the culling, lower number is more precision, don't change these during runtime
PixiCulling.cellSize.x = 50;
PixiCulling.cellSize.y = 50;


//initialize PixiCulling on your container
PixiCulling.init(container);

// run update on every frame or on changing the render area
PixiCulling.update();

PixiCulling.setDebug(true); // false by default, you can also use PixiCulling.toggleDebug();
//PixiCulling.setEnabled(true) // true by default, you can also use PixiCulling.toggleEnabled();

```
