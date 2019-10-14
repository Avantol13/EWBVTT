# Extensible Web-Based Virtual Table Top

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Milestone 1: Grid and Simple Blocks

- [x] Draggable grid and movable entities that snap to grid
- [x] Entities expose attributes used for drawing on canvas (color, location, etc.)
- [x] Can CRUD entity attributes (dialog box with editable fields)
- [x] Can Create/Delete entire entities
- [x] Simple navbar
- [x] Any entity update (movement/attribute change) reflected on all clients using websockets
- [x] Adjustable grid size

## Milestone 2: Map Mode

- [x] Mode selection option (Play or Edit)

* Edit mode makes map layer more transparent and darkens the grid
* Play mode returns map layer to opaque and lightens the grid

- [] Import image to map layer

> NOTE: Must be an image URL right now. Also not working for all sources b/c CORS. In future will need to be able to configure a bucket to upload to and configure it so this will work.

- [] Import image as an entity
- [] Images (maps/entities) should be an image url for now
- [] Fog of war?

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

## Google Storage Bucket Setup

Need to enable CORS.

`cors.json`:

```json
[
  {
    "origin": ["*"],
    "responseHeader": ["Content-Type"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

> NOTE: Should probably restrict the origin once the final site url is determined

Then run:

`gsutil cors set cors.json gs://bucket-name/`

