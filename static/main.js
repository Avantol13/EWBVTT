/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function openNavDropdown() {
  document.getElementById("navNewDropdown").classList.toggle("show");
}
// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {
    var navNewDropdown = document.getElementById("navNewDropdown");
    if (navNewDropdown.classList.contains('show')) {
      navNewDropdown.classList.remove('show');
    }
  }
}

function newEntity(raw_entity, layer, stage) {
  let entity;
  if (raw_entity.className == "Rect") {
    let entity_values;
    try {
      entity_values = getEntityValues(raw_entity);
    } catch (err) {
      console.log(`Could not create new entity. Error: ${err}`);
      return;
    }
    entity = new Konva.Rect(entity_values);
  } else {
    console.log(`could not determine class for ${raw_entity}`);
    return;
  }
  setEntityEventHandling(entity, stage, layer);
  layer.add(entity);
  layer.draw();
}

function updateEntity(raw_entity) {
  let entity_id = raw_entity.id;
  console.log(`updating ${entity_id}`);
  var shape = STAGE.find(`#${entity_id}`)[0];
  if (shape) {
    try {
      shape.attrs = getEntityValues(raw_entity);
      let newPosition = getSnappedPosition(shape.x(), shape.y())
      shape.x(newPosition.x);
      shape.y(newPosition.y);
      STAGE.draw();
    } catch (err) {
      console.log(`Could not update ${entity_id}. Error: ${err}`);
    }
  }
}

function saveEntity(entity_id, layer) {
  console.log(`saving ${entity_id}...`);
  var entity = STAGE.find(`#${entity_id}`)[0];
  var attributes = {};
  var attributesHtml = $(`#${entity_id}`).find('li');
  attributesHtml.each(function() {
    attributeName = $(this).find('.attribute')[0].innerText.replace(" ", "").replace(":", "");
    attributeValue = $(this).find('.attribute-value')[0].innerText.replace(" ", "").replace(":", "");
    if (attributeName) {
      attributes[attributeName] = attributeValue;
    }
  });
  updateEntity(getEntityValues(attributes));
  layer.draw();
  socket.emit('update entity', entity);
}

function newDefaultRectangle() {
  // create in top left
  var newPosition = getSnappedPosition(STAGE_X + 50, STAGE_Y + 50)
  newRectangle(newPosition.x, newPosition.y, MAIN_LAYER, STAGE);
}

function newRectangle(x, y, layer, stage, entity_id = null) {
  entity_id = entity_id || uuidv4();
  let rectangle = new Konva.Rect({
    id: entity_id,
    x: x,
    y: y,
    width: blockSnapSize * 1,
    height: blockSnapSize * 1,
    fill: '#fff',
    stroke: '#ddd',
    strokeWidth: 1,
    shadowColor: 'black',
    shadowBlur: 1,
    shadowOffset: { x: 1, y: 1 },
    shadowOpacity: 0.2,
    draggable: true
  });
  setEntityEventHandling(rectangle, stage, layer);
  layer.add(rectangle);
  stage.draw();
}

function setEntityEventHandling(entity, stage, layer) {
  let entity_id = entity.attrs.id;
  entity.on('dragstart', (e) => {
    SHADOW_RECT.show();
    SHADOW_RECT.moveToTop();
    entity.moveToTop();
  });
  entity.on('dragend', (e) => {
    entity.x(SHADOW_RECT.x());
    entity.y(SHADOW_RECT.y());
    stage.draw();
    SHADOW_RECT.hide();
    socket.emit('update entity', entity);
  });
  entity.on('dragmove', (e) => {
    let newPosition = getSnappedPosition(entity.x(), entity.y())
    SHADOW_RECT.x(newPosition.x);
    SHADOW_RECT.y(newPosition.y);
    stage.draw();
  });
  entity.on('click', (e) => {
    if (e.evt.button === 2) {
      if (!$(`div[aria-describedby='${entity_id}']`).length) {
        let content = `
<div id="${entity_id}" title="Basic dialog" class="ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-dialog-buttons ui-draggable ui-resizable">
  <p>This is the default dialog ${entity_id}</p>
</div>
`;
        $("#dialogs").append(content);
        socket.emit('update entity', entity);
        $(`#${entity_id}`).dialog({
          buttons: [{
              text: "Delete",
              icon: "ui-icon-trash",
              // showText: false,
              click: function() {
                socket.emit('delete entity', `${entity_id}`);
                $(`#${entity_id}`).dialog("destroy");
              }
            },
            {
              text: "Save",
              icon: "ui-icon-disk",
              // showText: false,
              click: function() {
                saveEntity(entity_id, layer);
              }
            }
          ]
        });
      }
      $(`#${entity_id}`).dialog('open');
      $(`#${entity_id}`).dialog("option", "position", { my: "right top", at: "right-5% top+10%", of: window });
    }
  });
}

// https://stackoverflow.com/a/2117523
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function get_number(value) {
  if (isNaN(value)) throw `${value} not a number`;
  return Number(value);
}

function getEntityValues(raw_entity) {
  if (raw_entity.className == "Rect") {
    for (const key of Object.keys(raw_entity)) {
      if (key == "draggable") {
        raw_entity.draggable = (raw_entity.draggable === true || raw_entity.draggable == 'true');
      } else if (key == "x") {
        raw_entity.x = get_number(raw_entity.x);
      } else if (key == "y") {
        raw_entity.y = get_number(raw_entity.y);
      } else if (key == "height") {
        raw_entity.height = get_number(raw_entity.height);
      } else if (key == "width") {
        raw_entity.width = get_number(raw_entity.width);
      } else if (key == "shadowBlur") {
        raw_entity.shadowBlur = get_number(raw_entity.shadowBlur);
      } else if (key == "shadowOffsetX") {
        raw_entity.shadowOffsetX = get_number(raw_entity.shadowOffsetX);
      } else if (key == "shadowOffsetY") {
        raw_entity.shadowOffsetY = get_number(raw_entity.shadowOffsetY);
      } else if (key == "shadowOpacity") {
        raw_entity.shadowOpacity = get_number(raw_entity.shadowOpacity);
      } else if (key == "strokeWidth") {
        raw_entity.strokeWidth = get_number(raw_entity.strokeWidth);
      } else if (key == "offsetX") {
        raw_entity.offsetX = get_number(raw_entity.offsetX);
      } else if (key == "offsetY") {
        raw_entity.offsetY = get_number(raw_entity.offsetY);
      } else if (key == "rotation") {
        raw_entity.rotation = get_number(raw_entity.rotation);
      } else if (key == "scaleX") {
        raw_entity.scaleX = get_number(raw_entity.scaleX);
      } else if (key == "scaleY") {
        raw_entity.scaleY = get_number(raw_entity.scaleY);
      } else if (key == "skewX") {
        raw_entity.skewX = get_number(raw_entity.skewX);
      } else if (key == "skewY") {
        raw_entity.skewY = get_number(raw_entity.skewY);
      } else {
        // unknown values default to string
        raw_entity[key] = raw_entity[key].toString()
      }
    }
  }
  return raw_entity
}

function mod(n, m) {
  // js modulo operator (%) is weird with negative numbers
  // https://stackoverflow.com/a/17323608
  return ((n % m) + m) % m;
}

function createGridLayer() {
  var gridLayer = new Konva.Layer();
  for (var i = START_X; i < STAGE_MAX_X; i += blockSnapSize) {
    gridLayer.add(new Konva.Line({
      points: [i, STAGE_Y, i, STAGE_MAX_Y],
      stroke: '#ddd',
      strokeWidth: 1,
      selectable: false
    }));
  }
  for (var j = START_Y; j < STAGE_MAX_Y; j += blockSnapSize) {
    gridLayer.add(new Konva.Line({
      points: [STAGE_X, j, STAGE_MAX_X, j],
      stroke: '#ddd',
      strokeWidth: 1,
      selectable: false
    }));
  }
  STAGE.add(gridLayer);
  gridLayer.moveToBottom();
  return gridLayer;
}

function getSnappedPosition(x, y) {
  var xRem = mod(x, blockSnapSize);
  var yRem = mod(y, blockSnapSize);
  if (xRem <= blockSnapSize / 2) {
    var newX = x - xRem;
  } else {
    var newX = x + (blockSnapSize - xRem);
  }
  if (yRem <= blockSnapSize / 2) {
    var newY = y - yRem;
  } else {
    var newY = y + (blockSnapSize - yRem);
  }
  return { "x": newX, "y": newY }
}

function recomputeGlobals() {
  WIDTH = $(window).width();
  HEIGHT = $(window).height();
  STAGE_X = -STAGE.attrs.x || 0;
  STAGE_Y = -STAGE.attrs.y || 0;
  STAGE_MAX_X = STAGE_X + WIDTH;
  STAGE_MAX_Y = STAGE_Y + HEIGHT;
  START_X = STAGE_X + (blockSnapSize - mod(STAGE_X, blockSnapSize));
  START_Y = STAGE_Y + (blockSnapSize - mod(STAGE_Y, blockSnapSize));
}

var WIDTH = $(window).width();
var HEIGHT = $(window).height();
var shadowOffset = 20;
var tween = null;
var blockSnapSize = 50;
var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
socket.on('deleted entity', function(data) {
  let entity_id = data;
  console.log(`deleting ${entity_id}`);
  var shape = STAGE.find(`#${entity_id}`)[0];
  shape.destroy();
  STAGE.draw();
});
socket.on('updated entity', function(data) {
  let entity_id = data.id;
  console.log(`updating ${entity_id}`);
  var shape = STAGE.find(`#${entity_id}`)[0];
  if (shape) {
    shape.attrs = data;
    shape.x(shape.attrs.x);
    shape.y(shape.attrs.y);
    MAIN_LAYER.draw();
  }
  var keys = Object.keys(data);
  ul = $(`<ul id=${entity_id}_dialog_attrs style="list-style-type: none;">`);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    ul.append(`<li><span class='attribute-delete ui-icon ui-icon-circlesmall-minus' onclick='$(this).closest(\"li\").remove(); saveEntity(\"${entity_id}\", MAIN_LAYER);'></span><code class='attribute'><em>` + key + "</em></code><em class='attribute-separator'>:</em><code class='attribute-value' contenteditable='true'>" + data[key] + "</code></li>");
  }
  ul.append("<li><code class='attribute new-attribute' contenteditable='true'></code><em class='attribute-separator'>:</em><code class='attribute-value new-attribute-value' contenteditable='true'></code></li>");
  $(`#${entity_id}`).html(ul);
});
var SHADOW_RECT = new Konva.Rect({
  x: 0,
  y: 0,
  width: blockSnapSize * 1,
  height: blockSnapSize * 1,
  fill: '#888888',
  opacity: 0.3,
  stroke: '#999999',
  strokeWidth: 3
});
var STAGE = new Konva.Stage({
  container: 'container',
  width: WIDTH,
  height: HEIGHT,
  draggable: true
});
STAGE.on('dragend', (e) => {
  recomputeGlobals();
  var newGridLayer = createGridLayer(STAGE);
  GRID_LAYER.destroy();
  GRID_LAYER = newGridLayer;
});
recomputeGlobals();
var GRID_LAYER = createGridLayer(STAGE);
var MAIN_LAYER = new Konva.Layer();
SHADOW_RECT.hide();
MAIN_LAYER.add(SHADOW_RECT);
STAGE.add(MAIN_LAYER);
// do not show context menu on right click
STAGE.on('contentContextmenu', (e) => {
  e.evt.preventDefault();
});
$.getJSON("/api/entities", function(response) {
  for (var i = 0; i < response.entities.length; i++) {
    newEntity(response.entities[i], MAIN_LAYER, STAGE);
  }
});
$(window).resize(function() {
  recomputeGlobals();
  STAGE.width(WIDTH);
  STAGE.height(HEIGHT);
  STAGE.draw();
  var newGridLayer = createGridLayer(STAGE);
  GRID_LAYER.destroy();
  GRID_LAYER = newGridLayer;
});