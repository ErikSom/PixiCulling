# PixiCulling [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Checkout%20this%20culling%20engine%20for%20pixi&url=https://github.com/ErikSom/PixiCulling&hashtags=pixi)
A cell based culling engine for Pixi

# Example
https://eriksom.github.io/PixiCulling/

# Notes
* Graphics need to have their pivot in the center
* Graphics are initialized once. If a graphic changes in shape or form during runtime you need to update the graphic size info, you can use PixiCulling.getSizeInfoForGraphic(graphic) for this
* For debugging the container needs to be a graphic

```javascript
//Example scripts, also feel free to look at the demo
import * as PixiCulling from './PixiCulling';
//render area sets the viewport that will be used to cull things, you can also change these during runtime
PixiCulling.renderArea.x = 100;
PixiCulling.renderArea.y = 100;
PixiCulling.renderArea.width = 200;
PixiCulling.renderArea.height = 300;

PixiCulling.marginCells = 1; // ads an extra border of X cells arround the renderArea, usefull when setting renderArea to full screen and you dont want big objects to pop in the screen, default=0 You can also set this to a negative number.

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
