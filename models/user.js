var mongoose=require("mongoose");

//User Schema
var UserSchema=mongoose.Schema({
	username:{
		type:String,
		required:true
	},
	pass:{
		type:String,
		required:true
	}
});

var User=module.exports=mongoose.model('User',UserSchema);
