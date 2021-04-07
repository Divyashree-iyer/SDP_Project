var mongoose=require("mongoose");

//Time Schema
var tableTypeTimeSchema=mongoose.Schema({
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

var TableTime=module.exports=mongoose.model('TableTime',tableTypeTimeSchema);
