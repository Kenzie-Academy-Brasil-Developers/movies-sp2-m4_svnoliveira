import express, { Application, json } from "express";
import { create, destroy, read, readById, update } from "./logic";
import "dotenv/config"
import { startDatabase } from "./database";
import { isMovieNameDuplicated, verifyMovieExists } from "./middleware";


const app: Application = express();
app.use(json());

app.post("/movies", isMovieNameDuplicated, create);
app.get("/movies", read);
app.get("/movies/:id", verifyMovieExists, readById);
app.patch("/movies/:id", verifyMovieExists, isMovieNameDuplicated, update);
app.delete("/movies/:id", verifyMovieExists, destroy);

const PORT = process.env.PORT;

const runningMsg = `Server running`;
app.listen(PORT, async () => {
    console.log(runningMsg);
    await startDatabase();
});
