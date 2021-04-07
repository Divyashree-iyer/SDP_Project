var mongoose=require("mongoose");

//Page Schema
var tableSchema=mongoose.Schema(
	{
		id:{
			type:String,//slug-tablename
			required:true
		},
		name:{
			type:String,
			required:true
		}
	},
	{
		timestamps:true
	}
);

var Table=module.exports=mongoose.model('Table',tableSchema);
