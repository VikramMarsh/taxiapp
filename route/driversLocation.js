var express = require('express');
var router=express.Router();
var mongojs = require('mongojs');

var db=mongojs('mongodb://marshall:marshall@ds231715.mlab.com:31715/taxiapp',['driverslocation'])

//getDriver location
router.get('/getdriverslocation',(req,res)=>{
	var io=req.app.io;

	db.driverslocation.find({"driverID":req.query.id},(err,driverLocation)=>{
		if(err)
			res.status(400).json({error:err})
		else{
			res.status(200).json(driverLocation[0]);
			io.emit('Track',driverLocation[0]);
		}
	});
});

//update driverslocation's socket
router.post('/driversLocationSocket/:id',(req,res)=>{
	
	if(!req.body)
		res.status(400).json({error:"Bad data"});
	else{
		db.driverslocation.update(
			{"_id":mongojs.ObjectId(req.params.id)},
			{"$set":{"socketID":req.body.socketID}},
			(err,doc)=>{
				if(err)
					res.status(400).json({error:err})
				else{
					res.status(200).json(doc)
				}
		});
	}
});

//get near by drivers
router.get('/nearByDrivers',(req,res)=>{
	let longitude=parseFloat(req.query.longitude);
	let latitude=parseFloat(req.query.latitude);
	db.driverslocation.createIndex({"coordinate":"2dsphere"});
	db.driverslocation.find({
		"coordinate":{
			"$near":{
				"$geometry":{"type":"Point","coordinates":[longitude,latitude]},
				"$maxDistance":10000
			}
		}
	},
	(err,doc)=>{
		console.log(doc)
		if(err)
			res.status(400).json({error:err})
		else
			res.status(200).json(doc)
	});
});

//update driver location by driver to user
router.put('/driverLocation/:id',(req,res)=>{
	var  io=req.app.io;
	let updatedlocation=req.body;
	let latitude=parseFloat(updatedlocation.latitude)
	let longitude=parseFloat(updatedlocation.longitude)

	if(!updatedlocation)
		res.status(400).json({error:"Bad Data"})
	else{
		db.driverslocation.findAndModify({
			query:{"_id":mongojs.ObjectId(req.params.id)},
			update:{"$set":{
				"socketID":updatedlocation.socketID,
				"coordinate":{ 
					"type":"Point",
					"coordinates":[longitude,latitude]
				}
			}
		},
		new:true},
		(err,location)=>{
			if(err)
				res.status(400).json(err)
			else{
				io.emit('action',{
					"type":"UPDATE_DRIVER_LOCATION",
					"payload":location

				})
				res.status(200).json(location);
			}
		});
	}
});

module.exports=router