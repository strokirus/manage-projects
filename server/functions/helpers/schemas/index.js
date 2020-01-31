const schemaProject = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "description": "project",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
      },
      "user": {
        "type": "string",
      },
      "id": {
        "type": "string",
      },
      "created": {
        "type": "number",
      },
      "updated": {
        "type": "number",
      },
    },
    "required": [
      "name",
      "user",
    ]
};

const schemaTasks = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "description": "project",
    "type": "object",
    "properties": {
      "description": {
        "type": "string",
      },
      "project": {
        "type": "string",
      },
      "id": {
        "type": "string",
      },
      "created": {
        "type": "number",
      },
      "updated": {
        "type": "number",
      },
    },
    "required": [
      "description",
      "project",
    ]
};

const schemaUser = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "description": "user",
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
      },      
      "email": {
        "type": "string",
      },
      "passwd": {
        "type": "string",
      },
      "created": {
        "type": "number",
      },
    },
    "required": [
      "name",
      "email",
      "passwd"
    ]
};

module.exports = {
    schemaProject,
    schemaTasks,
    schemaUser,
}