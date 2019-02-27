<div style="text-align:center"><img src ="https://imgur.com/7T9jMEa.png" /></div>

<!--![Overmorrow](assets/title.png)-->

## Introduction
Overmorrow is a Typescript game engine using the HTML5 Canvas API that was written primarily for personal use in developing top-down, tile-based games. See the [wiki](https://github.com/bsergent/overmorrow/wiki) for more details.

<div style="text-align:center"><img src ="https://imgur.com/sUeaHvA.png" /></div>
<!--![Screenshot of Overmorrow](https://imgur.com/sUeaHvA.png)-->

## Features
### Actions
Living entities in Overmorrow move and act based off their current and queued actions. 

```TypeScript
player.queueAction(new ActionMove(1, 0));
player.queueAction(new ActionUseItem(player.itemPrimary, 1));
```

### Animation Sheets
Animations, tags, filters. Will eventually be replaced with Sprites that support layering and mapping. 

### User Interface

### Items and Inventories
Item actions, usage, moving, types, weight, rarity, count, dimensions, etc.

### Collision and Physics
Basics implemented. 

### Serialization
Same engine used for saving and network transmission. 

### Tiled Map Support
Full support for [Tiled Map Editor](https://www.mapeditor.org/). Still need to detail the general layer structure supported (including special layer names such as `collision` and `entities`), as well as instructions for file file format to export as. 

### Procedural Generation Library
Partially implemented. 

### Curve Library
Not yet implemented.

### Dialogue Engine
Not yet implemented.

### Particle Engine
Not yet implemented.

## Getting Started
### Downloading the Latest Release
Download: https://github.com/bsergent/overmorrow/releases/

### Building the Engine
Yet to be written. 

### Extending the Engine
See the [demos](/js/demo/).

## Existing Games
* WynnTale
* Datura

Contact me if you make a game with this engine and would like it included here.

## Contributing
Everything is still in the very early stages, so it doesn't quite make sense to allow others to contribute while everything is still in flux. I would love contributors after I meet the [first milestone](https://github.com/bsergent/overmorrow/milestone/1).


## Random Links
https://phaser.io/

http://www.pixelprospector.com/sound-music-creation-software/

https://www.reddit.com/r/playmygame/