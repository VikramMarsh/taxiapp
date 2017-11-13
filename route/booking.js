var express = require('express');
var router=express.Router();
var mongojs = require('mongojs');

var db=mongojs('mongodb://marshall:marshall@ds231715.mlab.com:31715/taxiapp')

router.post('/booking',(req,res)=>{

	var io=req.app.io;

	let booking =req.body;
	let driver=req.body.driver;
	
	if(!booking)
		res.status(400).json({error:"Bad data"});
	else{
		db.bookings.save(booking,(err,doc)=>{
			if(err)
				res.status(400).json({error:err})
			else{
				res.json(doc);
				if(driver.socketID)
					io.emit(driver.socketID,doc);
				else
					console.log("driver not connected");
			}
		});
	}
});

//Update booking status from driver side
router.put('/booking/:id',(req,res)=>{
	var io=req.app.io
	let updatedBooking=req.body;
	if(!updatedBooking)
		res.status(400).json({error:"Bad Data"})
	else{
		db.bookings.findAndModify({
			query:{"_id":mongojs.ObjectId(req.params.id)},
			update:{"$set":{"driver.driverID":updatedBooking.driverID,"status":updatedBooking.status}},
			new : true},
			(err,updated)=>{
				if(err)
					res.status(400).json({error:err})
				if(updated){
							io.emit('action',{
								"type":"BOOKING_CONFIRMED",
								"payload":updated
							});
							console.log(updated);
						res.status(200).json(updated);

					}
				});
	}
});

module.exports=router