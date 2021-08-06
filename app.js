'use strict'
//
//declaration
//
const port = 3000;
const {Mysql} = require('./mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const express = require('express');
const app = express();
//
//
//var for connect and result
var connect = null;
var dataset = null;
var query_string = null;
var result = null;
//
//setup
//
app.engine('html', ejs.renderFile);
app.set('views', __dirname + '/public_html');
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended:true,limit:'5mb'}));
app.use('/static', express.static('static'));
app.use(function(req, res, next){
	res.header('Access-Control-Origin','*');
	res.header('Access-Control-Headers','Origin, X-Requested-With, Content-Type, Accept');
	next();
});
//read data siswa
app.post('/baca_siswa', async function(req, res){
	result = {};
	query_string= 'SELECT * FROM siswa';
	connect = new Mysql();
	connect.connect();
	result.get_jumlah_data_siswa = await connect.query(query_string);
	let search = req.body.search['value'];
	let limit = req.body.length;
	let start = req.body.start;
	let order_field = req.body.order[0]['column'];
	let order_field_data = req.body.columns[order_field]['data'];
	let order_ascdesc = req.body.order[0]['dir'];
	query_string += ` WHERE id LIKE '%${search}%'`;
	query_string += ` OR nama LIKE '%${search}%'`;
	query_string += ` OR jenis_kelamin LIKE '%${search}%'`;
	query_string += ` OR alamat LIKE '%${search}%'`;
	result.get_jumlah_data_siswa_terfilter = await connect.query(query_string);
	query_string += ` ORDER BY ${order_field_data} ${order_ascdesc} LIMIT ${start},${limit}`;
	result.get_data_siswa = await connect.query(query_string);
	connect.end();
	let callback = {
		'draw' : req.body.draw,
		'recordsTotal' : result.get_jumlah_data_siswa.length,
		'recordsFiltered' : result.get_jumlah_data_siswa_terfilter.length,
		'data' : result.get_data_siswa
	};
	res.writeHead(200, {'Content-Type':'application/json'});
	res.end(JSON.stringify(callback));
});
//load view tambah siswa
app.get('/tambah_siswa', function(req, res){
	res.render('create', {'title':'Tambah Data Siswa'});
});
//save tambah siswa
app.post('/tambah_siswa', async function(req, res){
	let nama = req.body.nama;
	let kelas = req.body.kelas;
	let jenis_kelamin = req.body.jenis_kelamin;
	let alamat = req.body.alamat;
	dataset = [null, nama, kelas, jenis_kelamin, alamat];
	query_string = "INSERT INTO siswa VALUES(?,?,?,?,?)";
	connect = new Mysql();
	connect.connect();
	result = await connect.query(query_string, dataset);
	connect.end();
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.write('<script>');
	if(result.affectedRows === 1){
		res.write("alert('Data siswa berhasil disimpan');");
		res.write("window.location = '/';");
	}
	else{
		res.write("alert('Data siswa gagal disimpan');");
		res.write("window.location = '/';");
	}
	res.end('</script>');
});
app.get('/ubah_siswa/:id', async function(req, res){
	let id = req.params.id;
	dataset = [id];
	query_string = "SELECT * FROM siswa WHERE id=?";
	connect = new Mysql();
	connect.connect();
	result = await connect.query(query_string, dataset);
	connect.end();
	if(result.length === 1){
		res.render('edit', {title:'Ubah Data Siswa', data:result});
	}
	else{
		res.write('<script>');
		res.write("alert('Id siswa tidak ditemukan');");
		res.write("window.location = '/';");
		res.end('</script>');
	}
});
app.post('/ubah_siswa', async function(req, res){
	let id = req.body.id;
	let nama = req.body.nama;
	let kelas = req.body.kelas;
	let jenis_kelamin = req.body.jenis_kelamin;
	let alamat = req.body.alamat;
	dataset = [nama, kelas, jenis_kelamin, alamat, id];
	query_string = "UPDATE siswa SET nama=?, kelas=?, jenis_kelamin=?, alamat=? WHERE id=?";
	connect = new Mysql();
	connect.connect();
	result = await connect.query(query_string, dataset);
	connect.end();
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.write('<script>');
	if(result.affectedRows === 1){
		res.write("alert('Data siswa berhasil diubah');");
		res.write("window.location = '/';");
	}
	else{
		res.write("alert('Data siswa gagal diubah');");
		res.write("window.location = '/';");
	}
	res.end('</script>');
});
app.get('/hapus_siswa/:id', async function(req, res){
	let id = req.params.id;
	dataset = [id];
	query_string = "DELETE FROM siswa WHERE id=?";
	connect = new Mysql();
	connect.connect();
	result = await connect.query(query_string, dataset);
	connect.end();
	res.writeHead(200, {'Content-Type' : 'text/html'});
	res.write('<script>');
	if(result.affectedRows === 1){
		res.write("alert('Data siswa berhasil dihapus');");
		res.write("window.location = '/';");
	}
	else{
		res.write("alert('Data siswa gagal dihapus');");
		res.write("window.location = '/';");
	}
	res.end('</script>');
});
app.use(function(req, res){
	res.render('read', {'title':'Dashboard Data Siswa'});
});
app.listen(port, function(){
	console.log('Server start in port : ' + port);
});