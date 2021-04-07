var mongoose=require("mongoose");

//Page Schema
var fieldSchema=mongoose.Schema(
	{
		name:{
			type:String,//fieldname
			required:true
		},
		datatype:{
			type:String,
			required:true
		},
		table_id:{
			type:String,//slug-tablename
			required:true
		},
		key:{
			type:Boolean,
			required:true,
			default:false
		}
	},
	{
		timestamps:true
	}

);

var Field=module.exports=mongoose.model('Field',fieldSchema);
