import { Request, Response } from "express";
import { Movie, MovieCreate, MovieResult } from "./interfaces";
import { client } from "./database";
import { QueryConfig } from "pg";
import format from "pg-format";

export const create = async (req: Request, res: Response): Promise<Response> => {
    const payload: MovieCreate = req.body;

    const queryTemplate: string = format(
        `INSERT INTO movies (%I)
        VALUES (%L)
        RETURNING *;`,
        Object.keys(payload),
        Object.values(payload)
    );

    const queryResult: MovieResult = await client.query(queryTemplate);
    const movie: Movie = queryResult.rows[0];

    return res.status(201).json(movie);
};

export const read = async (req: Request, res: Response): Promise<Response> => {
    const queryString: string = "SELECT * FROM movies;";
    const queryConfig: QueryConfig = {
        text: queryString,
    };

    const queryResult: MovieResult = await client.query(queryConfig);
    const movies: Movie[] = queryResult.rows;

    const category = req.query.category;

    if (category) {
        if (movies.some((movie) => movie.category === category)) {
            const filteredMovies = movies.filter((movie) => movie.category === category);
            return res.status(200).json(filteredMovies);
        } else {
            return res.status(200).json(movies);
        };
    } else {
        return res.status(200).json(movies);
    };
};

export const readById = (req: Request, res: Response): Response => {
    const movie: Movie = res.locals.movie;
    return res.status(200).json(movie);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const movie: Movie = res.locals.movie;
    const payload: MovieCreate = req.body;
    
    const queryTemplate: string = format(`
        UPDATE movies
        SET (%I) = ROW(%L)
        WHERE "id" = $1
        RETURNING *;`,
        Object.keys(payload),
        Object.values(payload)
    );

    const queryConfig: QueryConfig = {
        text: queryTemplate,
        values: [movie.id]
    };

    const queryResult: MovieResult = await client.query(queryConfig);
    const updatedMovie = queryResult.rows[0];

    return res.status(200).json(updatedMovie);
};

export const destroy = async (req: Request, res: Response): Promise<Response> => {
    const id: number = res.locals.movie.id;

    const queryString: string = `
    DELETE FROM movies
    WHERE "id" = $1;
    `;

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [id]
    };
    await client.query(queryConfig);

    return res.status(204).send();
};