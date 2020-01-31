const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const validator = require('jsonschema').Validator;

const {
  authMiddleware,
  generateToken,
} = require('./middleware/auth');

const {
  insert,
  getQuery,
  deleteCollection,
} = require('./helpers/db');

const {
  schemaUser,
  schemaTasks,
  schemaProject
} = require('./helpers/schemas');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

const app = express();

app.use(cors());

app.post('/user', async (req, res) => {
  const { body } = req;
  let response = new validator().validate(body, schemaUser);

  if (response.errors.length > 0) {
      res.status(412).json({ message: "Format error" });
      return false;
  }

  const users = await getQuery(db, 'users', 
    [{ field: 'email', value: body.email }],
    ['email', 'name', 'created']
  );

  if (users !== undefined && users.length === 0) {
    const { email, passwd, name } = body;

    let resInsert = await insert(db, 'users', email, { 
      email, passwd, name, created: new Date.getDate() 
    });

    res.status(200).json({ name: resInsert.name, email: resInsert.email });
  } else {
    res.status(208).json({ users });
  }
  
  return true;
});

app.get('/user/:email', authMiddleware, async (req, res) => {
  const { email } = req.query;

  if (email === undefined) {
    res.status(412).json({ message: 'Format error' });
    return false;
  }

  const users = await getQuery(db, 'users', 
    [{ field: 'email', value: email }],
    ['email', 'name', 'created']
  );

  res.status(200).json({ users });
  
  return true;
});

app.post('/project', authMiddleware, async (req, res) => {
  const { body } = req;
  let response = new validator().validate(body, schemaProject);

  if (response.errors.length > 0) {
      res.status(412).json({ message: "Format error" });
      return false;
  }

  const { name, user } = body;
  let { id } = body;

  if (!id) {
    id = await bcrypt.hash(`${name}:${user}:${new Date().getTime()}`);
  }

  let resInsert = await insert(db, 'project', id, { 
    name, user, id, created: new Date.getDate(), updated: new Date.getDate()  
  });

  res.status(200).json({
    name: resInsert.name,
    id: resInsert.id,
    user: resInsert.user
  });
  
  return true;
});

app.get('/project/:id', authMiddleware, async (req, res) => {
  const { id } = req.query;

  if (id === undefined) {
    res.status(412).json({ message: 'Format error' });
    return false;
  }

  const project = await getQuery(db, 'project', 
    [{ field: 'id', value: id }],
    ['email', 'name']
  );

  const tasks = await getQuery(db, 'tasks', 
    [{ field: 'project', value: id }],
    ['id', 'description', 'created', 'updated' ]
  );


  res.status(200).json({ project, tasks });
  
  return true;
});

app.post('/tasks', authMiddleware, async (req, res) => {
  const { body, user } = req;
  let response = new validator().validate(body, schemaTasks);

  if (response.errors.length > 0) {
      res.status(412).json({ message: "Format error" });
      return false;
  }

  const { description, project } = body;
  let { id } = body;

  if (!id) {
    id = await bcrypt.hash(`${description}:${project}:${user}:${new Date().getTime()}`);
  }

  let resInsert = await insert(db, 'tasks', id, { 
    description,
    project,
    id,
    created: new Date.getDate(),
    updated: new Date.getDate(),
    user,
  });

  res.status(200).json({
    description: resInsert.description,
    project: resInsert.project,
    id: resInsert.id,
    created: resInsert.created,
    updated: resInsert.updated,
    user: resInsert.user,
  });
  
  return true;
});

app.delete('/tasks/:id', authMiddleware, async (req, res) => {
  const { id } = req.query;

  if (id === undefined) {
    res.status(412).json({ message: 'Format error' });
    return false;
  }

  await deleteCollection(db, 'tasks', id);

  res.status(200).json({ id });
  
  return true;
});

app.delete('/projects/:id', authMiddleware, async (req, res) => {
  const { id } = req.query;

  if (id === undefined) {
    res.status(412).json({ message: 'Format error' });
    return false;
  }

  const tasks = await getQuery(db, 'tasks', 
    [{ field: 'project', value: id }],
    ['id']
  );

  for (let i = 0, c = tasks.length; i < c; i +=1) {
    // eslint-disable-next-line no-await-in-loop
    await deleteCollection(db, 'tasks', tasks[i]);
  }
  
  await deleteCollection(db, 'projects', id);

  res.status(200).json({ id });
  
  return true;
});

app.post('/auth', async (req, res) => {
  const { email, passwd } = req.body;

  const users = await getQuery(db, 'users', 
  [{ field: 'email', value: email }], ['email', 'passwd']);

  if (users && users.length > 0 && await bcrypt.compare(passwd, users[0].passwd)) {
    users[0].passwd = undefined;

    const token = generateToken({ id: users[0].email });

    res.status(200).json({ user: users[0].email, token });
    return true;
  }

  res.status(401).json({ message: 'Login/Password wrong' });
  
  return false;
});

exports.app = functions.https.onRequest(app);
