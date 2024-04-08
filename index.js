const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http").Server(app);
const PORT = 4000;

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let todoList = [
  {
    id: "cov5g0",
    title: "1) First task",
	description: 'First task description...',
    completed: false,
    progress: 99,
  },
  {
    id: "qetkxe",
    title: "2) Second task",
	description: 'Second task description...',
	completed: false,
    progress: 35,
  },
  {
    id: "qeHkxe",
    title: "3) Third task",
	description: 'description...',
	completed: false,
    progress: 0,
  },
];

socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on("disconnect", () => {
    socket.disconnect();
    console.log("🔥: A user disconnected");
  });

  socket.on("updateProgress", (data) => {
    const { id, progress } = data;
    const index = todoList.findIndex((t) => t.id === id);

    todoList[index] = {
      ...todoList[index],
      progress,
    };
	socket.emit("todos", todoList);

});

});
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// GET endpoint to fetch all todo items;
app.get("/todos", (_req, res) => {
  res.json(todoList);
});
// GET endpoint to fetch todo item with the specified `id`;
app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todo = todoList.find((t) =>{
	return t.id === id;
  });

  if (todo === undefined) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(200).json(todo);
});

// POST endpoint to add todo items;
app.post("/todos", (req, res) => {
  const todo = {
    id: Math.random().toString(36).substring(2, 8),
    title: req.body.title,
    description: req.body.description,
    completed: false,
    progress: 0,
  };
  todoList.unshift(todo);
  res.status(201).json(todo);
});

// DELETE endpoint to remove an existing todo item with the specified `id`;
app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  const index = todoList.find((t) => t.id === id);
  if (index === undefined) {
    return res.status(404).json({ error: "Todo not found" });
  }
  todoList.filter((t) => t.id !== id);
  res.status(204).send();
});

// PUT endpiont to update an existing todo item with the specified `id`;
app.put("/todos/:id", (req, res) => {
  const id = req.params.id;
  const index = todoList.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  const { title, description, completed, progress } = todoList[index];
  const todo = {
    id,
    title: req.body.title || title,
    description: req.body.description || description,
    completed:
      completed !== req.body.completed ? req.body.completed : completed,
    progress: req.body.progress || progress,
  };
  todoList[index] = todo;
  res.json(todo);
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
