import datetime
from mongoengine import *
import uuid
import json

# Defining a Document
class Entity(DynamicDocument):
    entity_id = StringField(
        required=True, unique=True,
        default=str(uuid.uuid4())
    )

    def to_dict(self):
        output = {
            key:value
            for key, value in
            self.to_mongo().to_dict().items()
        }
        # return an "id" field from the entity_id field
        del output["_id"]
        output["id"] = output["entity_id"]
        del output["entity_id"]

        return output

    def to_json(self):
        output = {
            key:value
            for key, value in
            json.loads(super().to_json()).items()
        }
        # return an "id" field from the entity_id field
        del output["_id"]
        output["id"] = output["entity_id"]
        del output["entity_id"]

        return output
