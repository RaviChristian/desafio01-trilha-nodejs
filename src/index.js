const express = require('express');
const cors = require('cors');

const { v4: uuidv4, v4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  
  const {username} = request.headers;

  const user = users.find((arrayItem) => arrayItem.username === username);

  if (!user) {
    return response.status(400).json({
      error : "User not found"
    });
  }

  request.user = user;

  return next();

};

//Route to add users.
app.post('/users', (request, response) => {
  
  const {name,username} = request.body;

  const userAlreadyExist = users.some(arrayItem => arrayItem.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({
      error: 'O usuário já existe!'
    });
  };

  const user = {
    id: v4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

//Route to get todos
app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  const todo = user.todos;

  return response.status(200).send(todo)
});

//Route to add todo in user's todos list
app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title,deadline} = request.body;

  const {user} = request;

  const todo = {
    id: v4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

//Route to edit an todo element.
app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const {title,deadline} = request.body;
  const {id} = request.params;
  const {user} = request;

  const todo = user.todos.find((arrayItem) => arrayItem.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Todo não existente"
    });
  };

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

//Route to set todo's "done" property to true
app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find((arrayItem)=> arrayItem.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Cannot edit a non existent todo"
    })
  }

  todo.done = true;

  return response.status(200).json(todo);
});

//Route to delete a todo
app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(arrayItem => arrayItem.id === id);

  if (!todo) {
    return response.status(404).json({
      error: "Cannot delete a non existent todo"
    })
  }
  user.todos.splice(todo,1);

  return response.status(204).send();

});

module.exports = app;