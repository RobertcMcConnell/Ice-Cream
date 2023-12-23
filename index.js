const pg = require('pg')
const client = new pg.Client('postgres://localhost/robs_icecream')
const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())

app.get('/', (req,res,next) => {
    res.send("Hello World")
})

app.get('/api/flavors', async (req,res,next) => {
    try {
        const SQL = `
        SELECT *
        FROM flavors;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

app.get('/api/flavors/:id' , async (req,res,next) => {
    try {
        const SQL =`
        SELECT * 
        FROM flavors
        WHERE id=$1;
        `
        const response = await client.query(SQL, [req.params.id])
        if(!response.rows.length){
            next({
                name: "id error",
                message: `food with ${req.params.id} not found`
            })
        }
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})


app.delete('/api/flavors/:id', async (req,res,next) => {
    try {
        const SQL =`
        DELETE
        FROM flavors
        WHERE id=$1
        `
        const respsonse = await client.query(SQL, [req.params.id])
        
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

app.use((error,req,res,next) => {
    res.status(500)
    res.send(error)
})

app.use('*', (req,res,next) => {
    res.send("No such route exists")
})

const start = async() => {
    await client.connect()
    console.log("connected to db")

    const SQL =`
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(25)
    );

    INSERT INTO flavors(name) VALUES ('cookies n cream');
    INSERT INTO flavors(name) VALUES ('strawberry');
    INSERT INTO flavors(name) VALUES ('cookie dough');
    INSERT INTO flavors(name) VALUES ('coffee');
    INSERT INTO flavors(name) VALUES ('fatboy sandwhich');
    `

    await client.query(SQL)
    console.log("table created and seeded")

    const port =process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}

start()