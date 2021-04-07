var mongoose=require("mongoose");

//File Schema
var tableTypeFileSchema=mongoose.Schema({
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

var TableFile=module.exports=mongoose.model('TableFile',tableTypeFileSchema);
