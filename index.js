const express = require("express");
const cors = require("cors");
const pool = require("./db");
const jwt = require("express-jwt");
const jwks = require("jwks-rsa");

const app = express();

//middleware
app.use(cors());
app.use(express.json()); //req.body

//ROUTES//

//create a todo

app.post("/todos", async (req, res) => {
  try {
    const { description, user } = req.body;

    const newTodo = await pool.query("INSERT INTO todo (description, user_id) VALUES($1,$2) RETURNING *", [description, user.sub]);

    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});
//get all todos

app.get("/todos/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const allTodos = await pool.query("SELECT * FROM todo WHERE user_id = $1", [user_id]);
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query("SELECT * FROM todo WHERE todo_id =$1", [id]);
    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//update a todo
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updateTodo = await pool.query("UPDATE todo SET description = $1 WHERE todo_id =$2", [description, id]);
    res.json("todo was updated");
  } catch (err) {
    console.error(err.message);
  }
});
//delete a todo

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
    res.json("todo was deleted");
  } catch (err) {
    console.error(err.message);
  }
});

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: "https://dev-nhal6dpq.us.auth0.com/.well-known/jwks.json",
  }),
  audience: "http://localhost:3000",
  issuer: "https://dev-nhal6dpq.us.auth0.com/",
  algorithms: ["RS256"],
});

app.use(jwtCheck);

app.get("/authorized", function (req, res) {
  res.send("Secured Resource");
});

app.listen(5001, () => {
  console.log("server has started on port 5001");
});
