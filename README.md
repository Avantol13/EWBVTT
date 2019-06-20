# Extensible Web-Based Virtual Table Top

## Milestone 1: Grid and Simple Blocks

- [x] Draggable grid and movable entities that snap to grid
- [x] Entities expose attributes used for drawing on canvas (color, location, etc.)
- [x] Can CRUD entity attributes (dialog box with editable fields)
- [x] Can Create/Delete entire entities
- [x] Simple navbar
- [x] Any entity update (movement/attribute change) reflected on all clients using websockets
- [x] Adjustable grid size

## Milestone 2: Map Mode

* Can easily draw shapes/import maps to a background layer
* Allow using an image as an entity
* Images (maps/entities) should be an image url for now
    * TODO: future plans could include a bucket to upload images to
* Fog of war?

## Milestone 3: Entity Rehaul

* Entity bank to drag and drop onto grid to create multiple, similar entities
    * Delete removes from grid not from bank
    * Should be able to CRUD entity bank "templates"
* Copy/Paste entities
* Better organize entity attributes and make editing more intuitive
    * Separate into: appearance, state (position) ?
* Easily add bars from attrs, circles or squares around entity based on attrs,
  toggle showing an image based on attrs

## Milestone 4: Actually make it easily extensible

TODO: Better define use-cases and expected customization capabilities

* Well-defined Python API
* Graphics API?
* Load JS plugins easily?
    * plugin folder that application loads from?

## Other ideas

* Special effects (animations/glow)
* Undo/redo capabilities
* Dice rolling
* Chat window
* Fog of war

## Known Bugs

* Entity shadow does not actually match entity size when moving if entity is not
  size of single grid space
* Significant lag when using browser zoom out (past 80%) and trying to move entity