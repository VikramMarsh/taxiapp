var express = require('express');
var router=express.Router();

var mongojs = require('mongojs');

var db=mongojs('mongodb://marshall:marshall@ds231715.mlab.com:31715/taxiapp')

router.get('/drivers',(req,res)=>{

	db.drivers.find({"_id":mongojs.ObjectId(req.query.id)},(err,driver)=>{
		if(err)
			res.status(400).json(err);
		else
			res.status(200).json(driver[0]);
	});	
});

module.exports=router;