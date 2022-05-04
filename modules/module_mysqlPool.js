let mysql = require('mysql');
let secretKeys = require('../modules/module_secretKeys');

let pool = mysql.createPool({
    connectionLimit: 250,
    host: '127.0.0.1',
    post: 3306,
    user: 'root',
    password: secretKeys.mySqlPassword,
    database: 'dt_engine',
    charset: 'latin1'
});


module.exports = pool;