const express = require('express');
const mysql = require('mysql');
const dotenv = require('dotenv');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

dotenv.config({ path: './.env'});
const db = mysql.createConnection({
    'host' : process.env.database_host,
    'user' : process.env.database_user,
    'password' : process.env.database_password,
    'database' : process.env.database
});

db.connect((err)=>{
    if(err) throw err;
    console.log('Successfully connected to the database!!')
})

const app = express();
app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: false }));  // Parse url encoded bodies sent by the HTML forms
app.use(express.json());  // Parse json bodies sent by the API server


// Authentication Routes
app.get('/', (req, res) => {
    res.send("Hiiii");
});

// app.get('/app/user', (req, res) => {
    
// });

app.post('/app/user', (req, res) => {
    const {username, password} = req.body;
    let sql = 'Select * from users where username = ?';
    db.query(sql, username, async (err, result) => {
        if(err)
        {
            return res.status(500).json({message: err.message});
        }
        if(result.length > 0)
        {
            return res.status(400).json({message: 'username already exist'});
        }
        let hashed_password = await bcrypt.hash(password, 8);
        console.log(hashed_password)
        db.query('Insert into users set ?', {username: username, password: hashed_password}, (err, result) => {
            if(err)
            {
                return res.status(500).json({message: err.message});
            }
            // console.log(result);
            return res.status(201).json({status: 'account created'})
        })
    })
});

app.post('/app/user/auth', (req, res) => {
    const {username, password} = req.body;
    let sql = 'Select * from users where username = ?';
    db.query(sql, username, (err, result) => {
        if(err)
        {
            return res.status(500).json({message: err.message});
        }
        if(result.length === 0)
        {
            return res.status(404).json({message: 'username does not exist'});
        }
        bcrypt.compare(password, result.password, (err, result) => {
            if(err)
            {
                return res.status(500).json({message: err.message});
            }
            if(!result)
            {
                return res.status(401).json({message: 'password incorrect'})
            }
            return res.status(200).json({status:'success', userId: result.userId});
        })
    })
});

app.listen('5500', () => {
    console.log('Listening on port 5500..')
})