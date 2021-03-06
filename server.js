var express = require('express');

var path = require('path');	
var bodyParser=require('body-parser');

var app=express();
var server= require('http').Server(app);

var io=require('socket.io')(server);

var booking=require('./route/booking');
var driversLocation=require('./route/driversLocation');
var drivers=require('./route/drivers');



app.get('/',(req,res)=>{
	res.sendFile(path.resolve(__dirname,'./public/index.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/api',booking);
app.use('/api',driversLocation);
app.use('/api',drivers);

server.listen((process.env.PORT || 8080),()=>{
	console.log("server running on port 8080");
});

app.io=io.on('connection',(socket)=>{
	console.log("socket connected "+socket.id);
})
