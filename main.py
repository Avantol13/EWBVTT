from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit
from mongoengine import *
from mongo import Entity
from config import config
import json

# Establishing a Connection
connect("mongoengine_test", host="localhost", port=27017)

app = Flask(__name__)
app.config["SECRET_KEY"] = config.SECRET_KEY
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/entities", methods=['GET'])
def get_entities():
    return jsonify({ "entities": [entity.to_dict() for entity in Entity.objects.all()] })

@socketio.on("delete entity", namespace="/test")
def delete_entity(entity_id):
    Entity.objects(entity_id=entity_id).delete()

    emit("deleted entity", entity_id, broadcast=True)


@socketio.on("update entity", namespace="/test")
def update_entity(data):
    data_dict = json.loads(data)
    entity_id = data_dict.get("attrs", {}).get("id", {})
    if not entity_id:
        print(f"error. {data_dict} has no 'attrs.id'")
        return

    # "flatten", get attrs on first level and then other things
    new = data_dict.pop("attrs")
    new["entity_id"] = new.pop("id")
    new.update(data_dict)

    Entity.objects(entity_id=entity_id).update(**new, upsert=True)
    entity = Entity.objects.get(entity_id=entity_id)

    emit("updated entity", entity.to_json(), broadcast=True)

@socketio.on("connect", namespace="/test")
def test_connect():
    emit("connected", {"data": "Connected"})

@socketio.on("disconnect", namespace="/test")
def test_disconnect():
    print("Client disconnected")

if __name__ == "__main__":
    socketio.run(app)