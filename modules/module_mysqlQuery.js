pool = require('./module_mysqlPool');

let query = function(query, options, callback){
    pool.getConnection(function(err, connection) {
        if(err){
            connection.release();
            callback(err, null);
        } else {
            connection.query(query, options, function(err, rows) {
                callback(err, rows);
                connection.release();
            });
        }
    });
};

module.exports = query;
