'use strict';
const mysql = require('mysql');

class Mysql{
	constructor(){
		this.connection = mysql.createConnection({
			host : '127.0.0.1',
			user : 'root',
			password : 'roottoor',
			database : 'express_mysql'
		});
	}
	connect(){
		this.connection.connect();
	}
	query(q, p = null){
		return new Promise((resolve, reject) => {
			this.connection.query(q, p, (error, results, fields) => {
				if (error) throw error;
				resolve(results);
			});
		});
	}
	end(){
		this.connection.end();
	}
}
module.exports.Mysql = Mysql;