const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

let db = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const convertMovieDbObjectToResponseObject = dbobject => {
  return {
    movieId: dbobject.movie_id,
    directorId: dbobject.director_id,
    movieName: dbobject.movie_name,
    leadActor: dbobject.lead_actor,
  }
}

const convertDirectorDbObjectToResponseObject = dbobject => {
  return {
    directorId: dbobject.director_id,
    directorName: dbobject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMovieQuery = `
    SELECT 
    movie_name
    FROM
    movie;`
  const moviesArray = await database.all(getMovieQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
    INSERT INTO
    movie(director_id,movie_name,lead_actor)
    VALUES
    (${directorId},'${movieName}','${leadActor}');`
  await database.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT *
    FROM
    movie
    WHERE
    movie_id = ${movieId};`
  const movie = await database.get(getMovieQuery)
  response.send(convertMovieDbObjectToResponseObject(movie))
})

/*app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
    UPDATE 
    movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}',
    WHERE
    movie_id = ${movieId};`

  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})*/
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateMovieQuery = `
    UPDATE movie
    SET
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
    `
  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE
    movie_id = ${movieId};`
  await database.run(deleteMovieQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
    SELECT
    *
    FROM
    director;`
  const directorArray = await database.all(getDirectorQuery)
  response.send(
    directorArray.map(eachDirector =>
      convertDirectorDbObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
    SELECT
     movie_name
    FROM
     movie
    WHERE
     director_id = '${directorId}';`
  const movieArray = await database.all(getDirectorMovieQuery)
  response.send(
    movieArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})
module.exports = app
