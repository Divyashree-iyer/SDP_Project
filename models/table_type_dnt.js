var mongoose=require("mongoose");

//Date and time Schema
var tableTypeDnTSchema=mongoose.Schema({
	name:{
		type:String,//fieldname
		required:true
	},
	table_id:{
		type:String,//slug-tablename
		required:true
	},
	value:{ //fieldvalue
		type:Date,
		required:true
	},
	doc_id:{
		type:String,
		required:true
	}
});

var TableDnT=module.exports=mongoose.model('TableDnt',tableTypeDnTSchema);
