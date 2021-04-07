var mongoose=require("mongoose");

//Date Schema
var tableTypeDateSchema=mongoose.Schema({
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

var TableDate=module.exports=mongoose.model('TableDate',tableTypeDateSchema);
