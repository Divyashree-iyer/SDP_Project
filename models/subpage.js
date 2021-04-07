var mongoose=require("mongoose");

var SubpageSchema=mongoose.Schema({
	title:{
		type:String,
		required:true
	},
	slug:{
		type:String,
		required:false
	},
	content:{
		type:String,
		required:true
	},
	page:{
		type:String,
		required:true
	},
	img:{
		type:String
	},
	table_name:{
		type:String
	}
	},
	{
		timestamps:true
	}
);

var Subpage=module.exports=mongoose.model("Subpage",SubpageSchema);