import { NextFunction, Response, Request } from "express";
import { client } from "./database";
import { QueryConfig } from "pg";
import { Movie } from "./interfaces";

export const isMovieNameDuplicated = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    const movieName: string = req.body.name;
    const queryString: string = `
    SELECT "name"
    FROM movies
    WHERE LOWER("name") = LOWER($1);
    `;
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [movieName],
    };
    const queryResult = await client.query(queryConfig);
    const movie = queryResult.rows[0];
    if (movie) {
        return res.status(409).json({
            "message": "Movie name already registered."
        });
    } else {
        return next();
    };
};

export const verifyMovieExists = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    const id = Number(req.params.id);
    const queryString: string = `
    SELECT *
    FROM movies
    WHERE "id" = $1;
    `;
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id],
    };
    const queryResult = await client.query(queryConfig);
    const movie: Movie = queryResult.rows[0];
    if (!movie) {
        return res.status(404).json({
            "message": "Movie not found!"
        });
    } else {
        res.locals.movie = movie;
        return next();
    };
};