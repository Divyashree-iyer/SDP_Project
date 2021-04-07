var mongoose=require("mongoose");

//Page Schema
var tableTypeNumberSchema=mongoose.Schema({
	name:{
		type:String,//fieldname
		required:true
	},
	table_id:{
		type:String,//slug-tablename
		required:true
	},
	value:{ //fieldvalue
		type:Number,
		required:true
	},
	doc_id:{
		type:String,
		required:true
	}
});

var TableNumber=module.exports=mongoose.model('TableNumber',tableTypeNumberSchema);
