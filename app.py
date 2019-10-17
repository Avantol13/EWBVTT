from flask import Flask, render_template, jsonify, make_response
from flask_socketio import SocketIO, emit
from mongoengine import *
from mongo import Entity, DoesNotExist
from config import config
import json
import logging

# Establishing a Connection
connect("ewbvtt", host=config.MONGODB_URI)

app = Flask(__name__)
app.config["SECRET_KEY"] = config.SECRET_KEY
socketio = SocketIO(app)

logging.basicConfig(level=(logging.DEBUG if config.DEBUG else logging.INFO))
logging.getLogger('flask_cors').level = logging.DEBUG

@app.route("/")
def index():
    response = make_response(render_template("index.html"))
    return response


@app.route("/api/entities", methods=["GET"])
def get_entities():
    return jsonify({"entities": [entity.to_dict() for entity in Entity.objects.all()]})


@socketio.on("delete entity", namespace="/test")
def delete_entity(entity_id):
    Entity.objects(entity_id=entity_id).delete()
    logging.info(f"deleted entity {entity_id}")
    emit("deleted entity", entity_id, broadcast=True)


@socketio.on("update entity", namespace="/test")
def update_entity(data):
    data_dict = json.loads(data)
    entity_id = data_dict.get("attrs", {}).get("id", {})
    if not entity_id:
        logging.error(f"error. {data_dict} has no 'attrs.id'")
        return

    # "flatten", get attrs on first level and then other things
    new = data_dict.pop("attrs")
    new["entity_id"] = new.pop("id")
    new.update(data_dict)

    # get current fields to diff against fields provided
    # any missing fields will be removed by using mongo's "unset" option
    try:
        current = Entity.objects.get(entity_id=entity_id).to_json()
        current.pop("id")
        to_remove = {
            "unset__{}".format(key): 1 for key in set(current.keys()) - set(new.keys())
        }
        new.update(to_remove)
    except DoesNotExist:
        # no existing record, so create everything
        pass

    Entity.objects(entity_id=entity_id).update(**new, upsert=True)
    entity = Entity.objects.get(entity_id=entity_id)

    logging.info(f"emit updated entity {entity.to_json().get('id')}")
    logging.debug(entity.to_json())
    emit("updated entity", entity.to_json(), broadcast=True)


@socketio.on("connect", namespace="/test")
def test_connect():
    emit("connected", {"data": "Connected"})
    logging.info("client connected")


@socketio.on("disconnect", namespace="/test")
def test_disconnect():
    logging.info("Client disconnected")


if __name__ == "__main__":
    logging.debug("starting socketio")
    socketio.run(app)
