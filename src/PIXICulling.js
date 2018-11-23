import * as PIXI from 'pixi.js';

let cellDictionary = {};
let renderArea = {
    x: 100,
    y: 300,
    width: 400,
    height: 400
};
let cellSize = {
    x: 200,
    y: 200
};
let container;
let updateTicks = 0;
let debugGraphics;
let visibleCells = {};
const settingsIndexCount = 2;
export let debug = true;

export const init = function (_container) {

    container = _container;

    cellDictionary = {};
    for (var i = 0; i < container.children.length; i++) {
        //graphic.renderable = false;
        placeGraphicInCells(container.children[i]);
    }

    const _pixiContainerAddChildSuper = container.addChild;
    container.addChild = function addChild(child) {
        if (arguments.length == 1) child = [child];
        _pixiContainerAddChildSuper.apply(this, child);
        for (let i = 0; i < child.length; i++) {
            //make sure graphics are drawn
            console.log("ADD CHILD!", child[i]);
            setTimeout(()=>{placeGraphicInCells(child[i])}, 0);
        }
    };
    const _pixiContainerAddChildAtSuper = container.addChildAt;
    container.addChildAt = function addChildAt(child, index) {
        _pixiContainerAddChildAtSuper.apply(this, [child, index]);
        if (child._cullingCells != undefined) return;
        //make sure graphics are drawn
        setTimeout(()=>{placeGraphicInCells(child[i])}, 0);
    };
    const _pixiContainerRemoveChildSuper = container.removeChild;
    container.removeChild = function removeChild(child) {
        if (arguments.length == 1) child = [child];
        _pixiContainerRemoveChildSuper.apply(this, child);
        for (let i = 0; i < child.length; i++) {
            removeGraphicFromCells(child[i]);
        }
    };
    update();
    console.log(cellDictionary);
}

const placeGraphicInCells = function (graphic) {
    if(graphic == debugGraphics) return;
    if (!graphic.visible) return;
    if (graphic._cullingCells != undefined) {
        removeGraphicFromCells(graphic);
    } else {
        initGraphicForCulling(graphic);
    }

    if(graphic._cullingSizeDirty) getSizeInfoForGraphic(graphic);

    const startX = Math.floor((graphic.x - graphic._cullingWidthExtent) / cellSize.x);
    const startY = Math.floor((graphic.y - graphic._cullingHeightExtent) / cellSize.y);

    for(let i = 0; i<graphic._cullingXTiles; i++){
        for(let j = 0; j<graphic._cullingYTiles; j++){

            const cellX = startX + i;
            const cellY = startY + j;
            const cell = `${cellX}_${cellY}`;
            if (cellDictionary[cell] == undefined) cellDictionary[cell] = [false, 0];
            cellDictionary[cell].push(graphic);

            if(cellDictionary[cell][0]) graphic._cullingVisibleCells++;


            //if(graphic.data && graphic.data.refName == 'test123') console.log(cellDictionary[cell]);

            graphic._cullingCells.push(cell);
        }
    }
    setGraphicsVisible([0, 0, graphic]);
}
const removeGraphicFromCells = function (graphic) {
    graphic._cullingCells.map((cell) => {
        cellDictionary[cell] = cellDictionary[cell].filter(item => item !== graphic);
        if (cellDictionary[cell].length == settingsIndexCount && !cellDictionary[cell][0]) delete cellDictionary[cell];
    });
    graphic._cullingVisibleCells = 0;
    graphic._cullingCells = [];
}
const initGraphicForCulling = function(graphic){
    const _pixiContainerUpdateSuper = graphic.updateTransform;
    graphic.updateTransform = function updateTransform() {
        if (this.transform._localID != this.transform._currentLocalID) {
            placeGraphicInCells(graphic);
        }
        _pixiContainerUpdateSuper.apply(this);
    };
    graphic._cullingSizeDirty = true;
    graphic._cullingCells = [];
    graphic._cullingVisibleCells = 0;
    graphic._cullings = 0;
}
const getSizeInfoForGraphic = function(graphic){
    const bounds = graphic.getBounds();
    graphic._cullingWidthExtent = bounds.width/2;
    graphic._cullingHeightExtent = bounds.height/2;
    graphic._cullingXTiles = Math.ceil(bounds.width / cellSize.x);
    graphic._cullingYTiles = Math.ceil(bounds.height / cellSize.y);
    graphic._cullingSizeDirty = false;
}

const updateVisibleCells = function () {
    updateTicks++;
    const global_sp = new PIXI.Point(renderArea.x, renderArea.y);
    const global_ep = new PIXI.Point(renderArea.x + renderArea.width, renderArea.y + renderArea.height);
    const sp = container.toLocal(global_sp);
    const ep = container.toLocal(global_ep);
    const w = ep.x - sp.x;
    const h = ep.y - sp.y;
    if (debug) {
        debugGraphics.lineStyle(10, 0x00FF00, 1);
        debugGraphics.drawRect(sp.x, sp.y, w, h);
    }

    const startTileX = Math.floor(sp.x / cellSize.x);
    const startTileY = Math.floor(sp.y / cellSize.y);

    const visibileXTiles = Math.ceil(w / cellSize.x) + 1;
    const visibileYTiles = Math.ceil(h / cellSize.y) + 1;

    for (let i = 0; i < visibileXTiles; i++) {
        for (let j = 0; j < visibileYTiles; j++) {
            let tileX = startTileX + i;
            let tileY = startTileY + j;
            let cell = `${tileX}_${tileY}`;

            if (cellDictionary[cell] == undefined) {
                cellDictionary[cell] = [true, updateTicks];
            } else {
                cellDictionary[cell][1] = updateTicks;
            }
            visibleCells[cell] = cell;

            if (debug) {
                debugGraphics.lineStyle(10, 0x008800, 0.5);
                debugGraphics.drawRect(tileX * cellSize.x, tileY * cellSize.y, cellSize.x, cellSize.y);
            }

        }
    }
}
const updateCells = function () {
    Object.keys(visibleCells).map(cell => {
        if (cellDictionary[cell][1] != updateTicks) {
            console.log('NOT VISIBLE!', cell, cellDictionary[cell].length);
            cellDictionary[cell][0] = false;
            for (let i = settingsIndexCount; i < cellDictionary[cell].length; i++) {
                cellDictionary[cell][i]._cullingVisibleCells--;
            }
            //was visible is now not visible any more
            console.log("CHECK VISIBILITY:");
            setGraphicsVisible(cellDictionary[cell]);
            console.log("UP HEREEEEE");

            if (cellDictionary[cell].length == settingsIndexCount) delete cellDictionary[cell];
            delete visibleCells[cell];
        } else if (cellDictionary[cell][1] == updateTicks && cellDictionary[cell][0] == false) {
            cellDictionary[cell][0] = true;
            // was not visible and is now visible
            for (let i = settingsIndexCount; i < cellDictionary[cell].length; i++) {
                cellDictionary[cell][i]._cullingVisibleCells++
            }
            console.log("2CHECK VISIBILITY:");
            setGraphicsVisible(cellDictionary[cell]);
            console.log("2UP HEREEEEE");
        }
    });
}
const setGraphicsVisible = function (arr) {
    for (let i = settingsIndexCount; i < arr.length; i++) {
        //if(arr[i].data && arr[i].data.refName == 'head') console.log(arr[i]._cullingVisibleCells);
        arr[i].renderable = (arr[i]._cullingVisibleCells>0);
    }
}
const drawAllCells = function () {
    debugGraphics.lineStyle(10, 0xFF0000, 0.5);
    Object.keys(cellDictionary).map(cell => {
        const splitCellString = cell.split('_');
        let tileX = parseInt(splitCellString[0]);
        let tileY = parseInt(splitCellString[1]);
        debugGraphics.drawRect(tileX * cellSize.x, tileY * cellSize.y, cellSize.x, cellSize.y);
    });
}
export const update = function () {
    if (debug) {
        if (!debugGraphics) {
            debugGraphics = container;
        }
        debugGraphics.clear();
        drawAllCells();
    }

    updateVisibleCells();
    updateCells();
}