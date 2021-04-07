var mongoose=require("mongoose");

//Page Schema
var tableTypeStringSchema=mongoose.Schema({
	name:{
		type:String,//fieldname
		required:true
	},
	table_id:{
		type:String,//slug-tablename
		required:true
	},
	value:{ //fieldvalue
		type:String,
		required:true
	},
	doc_id:{
		type:String,
		required:true
	}
});

var TableString=module.exports=mongoose.model('TableString',tableTypeStringSchema);
