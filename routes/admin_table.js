var express=require("express");
var router=express.Router();
const { check, validationResult } = require('express-validator/check');
const mongoose=require("mongoose");
const resizeImg=require("resize-img");
const fs=require("fs-extra");

//get page model
var Page=require("../models/page");

//get subpage model
var Subpage=require("../models/subpage");

//get tableschema model
var Table=require("../models/tableschema");

//get fieldschema model
var Field=require("../models/fieldschema");

//get tablestring model
var StringTable=require("../models/table_type_string");

//get tablenumber model
var NumberTable=require("../models/table_type_number");

//get date table model
var DateTable=require("../models/table_type_date");

//get time table model
var TimeTable=require("../models/table_type_time");

//get date and time table model
var DnTTable=require("../models/table_type_dnt");

//get file table model
var FileTable=require("../models/table_type_file");


//GET request from /
router.get("/",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../");
	else{

	Table.find({},function(err, tables){
		
		res.render('admin/tables',{
			title:"Tables",
			tables:tables
		});
	});
	}
});

//Get add page
router.get("/add-doc/:tableid",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	var fieldTypes=[],fieldNames=[];
	var tableid=req.params.tableid;
	Field.find({table_id:req.params.tableid},function(err, fields){
		for(var i=0;i<fields.length;i++)
		{
				fieldTypes.push(fields[i].datatype);
				fieldNames.push(fields[i].name);
		}
		Table.findOne({id:tableid},function(err,table){
		
			var slug=tableid.substring(0,tableid.lastIndexOf(table.name)-1);
			console.log(slug);
	
			Subpage.findOne({slug:slug},function(err,subpage){
				console.log("subpage : "+subpage);
				res.render('admin/add_doc',{
					title:"Add Document",
					tableName:table.name,
					tableid:req.params.tableid,
					fieldNames:fieldNames,
					fieldTypes:fieldTypes,
					subpage:subpage.title,
					page:subpage.page
				});
			});
			
		});
		
	});
	}
});



//POST add page
router.post("/add-doc/:tableid",function(req,res){
	var values=[].concat(req.body.value);
	var l=0;
	for(var i=0;i<values.length;i++){
		if(values[i]!=""){
			l++;
		}
	}
	var files=[],fileNames=[],fileLength=0;
	if(req.files){
		files=[].concat(req.files.file);
		fileLength=files.length
	}
	
	for(var i=0;i<fileLength;i++)
		fileNames.push(files[i].name);

	var pkey;
	Field.find({table_id:req.params.tableid},function(err, fields){
		console.log("val="+values.length+" file="+fileLength + " fields: "+ fields.length);
		if(fields.length > (l+fileLength)){
			req.flash("danger","empty value");
		
		res.redirect("/admin/tables/add-doc/"+req.params.tableid);
		}
		else{
		for(var i=0;i<fields.length;i++)
		{
			if(fields[i].key==true)
				pkey=i;
		}
		
		var docid='d-' + Math.random().toString(36).substr(2, 9);
		console.log(docid);
		var i=0,k=0;
		for(var j=0;j<values.length+fileLength;j++)
		{
			console.log("datatype : "+fields[j].datatype);
			
			if(("Text")===(fields[j].datatype))
			{
				var stringvalue=new StringTable({
					name:fields[j].name,
					table_id:req.params.tableid,
					value:values[i],
					doc_id:docid //values[pkey]
				});
				i++;
				stringvalue.save(function(err){
					if(err)
						return console.log(err);
				});
			}
			else if(("Number")===(fields[j].datatype))
			{
				var numbervalue=new NumberTable({
					name:fields[j].name,
					table_id:req.params.tableid,
					value:values[i],
					doc_id:docid //values[pkey]
				});
				i++;
				numbervalue.save(function(err){
					if(err)
						return console.log(err);
				});
			}
			else if(("Date")===(fields[j].datatype))
			{
				var datevalue=new DateTable({
					name:fields[j].name,
					table_id:req.params.tableid,
					value:values[i],
					doc_id:docid //values[pkey]
				});
				i++;
				datevalue.save(function(err){
					if(err)
						return console.log(err);
				});
			}
			else if(("Time")===(fields[j].datatype))
			{
				var timevalue=new TimeTable({
					name:fields[j].name,
					table_id:req.params.tableid,
					value:values[i],
					doc_id:docid //values[pkey]
				});
				i++;
				timevalue.save(function(err){
					if(err)
						return console.log(err);
				});
			}
			else if(("datetime-local")===(fields[i].datatype))
			{
				var dntvalue=new DnTTable({
					name:fields[j].name,
					table_id:req.params.tableid,
					value:values[i],
					doc_id:docid //values[pkey]
				});
				i++;
				dntvalue.save(function(err){
					if(err)
						return console.log(err);
				});
			}
			else if(("File")===(fields[j].datatype))
				{
					var filevalue=new FileTable({
						name:fields[j].name,
						table_id:req.params.tableid,
						value:fileNames[k],
						doc_id:docid //values[pkey]
					});
					
					filevalue.save(function(err){
						if(err)
							return console.log(err);
					});
					
					var fpath="public/files/"+req.params.tableid+"/"+docid; //values[pkey];
					
					if(fileNames[k]!="")
					{
						fs.mkdirSync(fpath, { recursive: true })
						console.log("folder made");
						var File=files[k];
						var path=fpath+"/"+fileNames[k];
						
						File.mv(path,function(err){
							if(err)
								console.log(err);
							else
								console.log("file uploaded");
							});
					}
					k++;
					
				}
		}
		
		req.flash('success','Document Added Successfully');
		res.redirect("/admin/tables");
		}
	});
	
});

router.get("/delete/:tableid",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
		var slug;
		Table.findOne({id : req.params.tableid}, function(err, table){
			slug=table.id.substring(0,table.id.lastIndexOf(table.name)-1);
			Subpage.findOneAndUpdate({slug: slug },{ table_name: ""} , null , function(err,doc){} );
		});
	DateTable.deleteMany({ table_id:req.params.tableid}, function (err) {
	  if(err) console.log(err);

	TimeTable.deleteMany({ table_id:req.params.tableid}, function (err) {
	  if(err) console.log(err);
	  
	DnTTable.deleteMany({ table_id:req.params.tableid}, function (err) {
	  if(err) console.log(err);
	
	FileTable.deleteMany({ table_id:req.params.tableid}, function (err) {
	  if(err) console.log(err);
	  else{
		 
		  if (fs.existsSync('public/files/'+req.params.tableid)) {
			  
		  try{
		fs.removeSync('public/files/'+req.params.tableid);
		console.log("folder deleted");
		  }catch(err){console.log("folder not deleted");}
		  }
	  }
	 
	StringTable.deleteMany({ table_id:req.params.tableid}, function (err) {
	  if(err) console.log(err);
	 
	
	NumberTable.deleteMany({ table_id:req.params.tableid}, function (err) {
	  if(err) console.log(err);
	  
	   
	
	Field.deleteMany({ table_id:req.params.tableid}, function (err) {
	  if(err) console.log(err);
	  
	
	Table.deleteMany({ id:req.params.tableid}, function (err) {
	  if(err) console.log(err);
	  
	  
	  req.flash("success", "Table deleted");
	res.redirect("/admin/tables");
	});
	});
	});
	});
	});
	});
	});
	});
	}
});
router.get("/view/:tableid",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	Table.findOne({id:req.params.tableid},function(err,table){
		
		Field.findOne({table_id:req.params.tableid, key:true},function(err, field){
				
				var keyfield=field.name;
				var keyvalues=[],docids=[];
				console.log(field);
				var model;
				switch(field.datatype) {
					case "Text":
						model=StringTable;
					break;
					case "Number":
						model=NumberTable;
					break;
					case "Date":
						model=DateTable;
					break;
					case "Time":
						model=TimeTable;
					break;
					case "datetime-local":
						model=DnTTable;
					break;
				}
				model.find({table_id:req.params.tableid,name:keyfield},function(err,val){
					if(val)
					{
						for(var i=0;i<val.length;i++)
						{
							keyvalues.push(val[i].value);
							docids.push(val[i].doc_id);
						}
					
						res.render("admin/view_doc",{
							title:"View Document",
							name:table.name,
							docs:keyvalues,
							tableid:req.params.tableid,
							doc_id:docids,
							field:keyfield
						});
					}
				});
		});
		
	});	
	}
});

router.get('/edit-doc/:tableid/:doc_id',function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	var fieldTypes=[],fieldNames=[];
	var tableid=req.params.tableid;
	Field.find({table_id:tableid},function(err, fields){
		for(var i=0;i<fields.length;i++)
		{
				fieldTypes.push(fields[i].datatype);
				fieldNames.push(fields[i].name);
		}
		Table.findOne({id:tableid},function(err,table){
			var slug=tableid.substring(0,tableid.lastIndexOf(table.name)-1);
			console.log(slug);
			Subpage.findOne({slug:slug},function(err,subpage){
				var docs=[];
				var fieldValues=0;
				StringTable.find({doc_id:req.params.doc_id},function(err,sv){
					fieldValues+=sv.length;
					NumberTable.find({doc_id:req.params.doc_id},function(err,nv){
						fieldValues+=nv.length;
						DateTable.find({doc_id:req.params.doc_id},function(err,dv){
							fieldValues+=dv.length;
							TimeTable.find({doc_id:req.params.doc_id},function(err,tv){
								fieldValues+=tv.length;
								DnTTable.find({doc_id:req.params.doc_id},function(err,dtv){
									fieldValues+=dtv.length;
									FileTable.find({doc_id:req.params.doc_id},function(err,fv){
										fieldValues+=fv.length;
										var s=0,n=0,d=0,t=0,dt=0,f=0;
										for(var i=0;i<fieldValues;i++)
										{
											if(fieldTypes[i]==="Text")
											{
												docs.push(sv[s].value);
												s++;
											}
											else if(fieldTypes[i]==="Number")
											{
												docs.push(nv[n].value);
												n++;
											}
											else if(fieldTypes[i]==="Date")
											{
												var month=dv[d].value.getMonth(), date=dv[d].value.getDate();
												
												if (month < 10) { month = '0' + dv[d].value.getMonth(); }
												if (date < 10) { date = '0' + dv[d].value.getDate(); }
												docs.push(dv[d].value.getFullYear()+"-"+month+"-"+date);
												
												d++;
											}
											else if(fieldTypes[i]==="Time")
											{
												docs.push(tv[t].value);
												t++;
											}
											else if(fieldTypes[i]==="datetime-local")
											{
												var month=dtv[dt].value.getMonth(), date=dtv[dt].value.getDate();
												if (month < 10) { month = '0' + dtv[dt].value.getMonth(); }
												if (date < 10) { date = '0' + dtv[dt].value.getDate(); }
												docs.push(dtv[dt].value.getFullYear()+"-"+month+"-"+date+"T"+dtv[dt].value.getHours()+":"+dtv[dt].value.getMinutes());
												dt++;
											}
											else if(fieldTypes[i]==="File")
											{
												
												docs.push(fv[f].value);
												f++;
											}
										}
										if(fieldNames.length-fieldValues!=0)
											for(var i=fieldNames.length-fieldValues;i<fieldNames.length;i++)
												docs.push("");
										res.render('admin/edit_doc',{
											title:"Edit Document",
											tableName:table.name,
											tableid:req.params.tableid,
											fieldNames:fieldNames,
											fieldTypes:fieldTypes,
											subpage:subpage.title,
											page:subpage.page,
											docs:docs,
											doc_id:req.params.doc_id
										});	
									});
								});
							});
						});
					});
				});		
			});
		});
	});
	}
});


router.post("/edit-doc/:tableid/:doc_id",function(req,res){
	
	var values=req.body.value;
	
	var l=0;
	for(var i=0;i<values.length;i++){
		if(values[i]!=""){
			l++;
		}
	}
	var files=[],fileNames=[],fileLength=0;
		if(req.files){
			files=[].concat(req.files.file);
			fileLength=files.length

		}

	for(var i=0;i<fileLength;i++)
			fileNames.push(files[i].name);
	
	var pkey;
	Field.find({table_id:req.params.tableid},function(err, fields){
		console.log("val="+l+" file="+fileLength + " fields: "+ fields.length);
		if(fields.length  > (l+fileLength)){
			req.flash("danger","empty value");
		
		res.redirect("/admin/tables/edit-doc/"+req.params.tableid +"/"+ req.params.doc_id);
		}
		else{
		for(var i=0;i<fields.length;i++)
		{
			if(fields[i].key==true)
			{	pkey=i; break; }
		}
		var k=0;
		for(var i=0;i<fields.length;i++)
		{
			var model,m;
				switch(fields[i].datatype) {
					case "Text":
						model=StringTable;
					break;
					case "Number":
						model=NumberTable;
					break;
					case "Date":
						model=DateTable;
					break;
					case "Time":
						model=TimeTable;
					break;
					case "datetime-local":
						model=DnTTable;
					break;
					case "File":
						m=FileTable;
					break;
						
				}
				if(m){
					var fileInfo=files[k];
					var fileName=fileNames[k];
					var fname=fields[i].name;
					if(fileName){
				m.findOne({doc_id:req.params.doc_id,name:fields[i].name},function(err,f){
		
					if(!f){
						var filevalue=new FileTable({
							name:fname,
							table_id:req.params.tableid,
							value:fileName,
							doc_id:req.params.doc_id
						});
						
						filevalue.save(function(err){
							if(err)
								return console.log(err);
							else console.log("saved in db");
						});
						var fpath="public/files/"+req.params.tableid+"/"+req.params.doc_id; //values[pkey];
						fs.mkdirSync(fpath, { recursive: true });
						var File=files[k];
						var path=fpath+"/"+fileName;
						
						File.mv(path,function(err){
							if(err)
								console.log(err);
							else{
								console.log("new file uploaded");
								
							}
						});
					}
					else{
					var rpath="public/files/"+req.params.tableid+"/"+req.params.doc_id+"/"+f.value;
					var fpath="public/files/"+req.params.tableid+"/"+req.params.doc_id;
					
					if(fileName!="")
					{
						f.value=fileName;
						
						f.save(function(err){
						try {
						  fs.removeSync(rpath);
						} catch(err) {
						  console.error(err)
						}
						
						var File=fileInfo;
						var path=fpath+"/"+fileName;
						
						File.mv(path,function(err){
							if(err)
								console.log("file not uploaded");
							else 
								console.log("file uploaded");
						});
						});
					}
					}
					k++;
				
					});}
				}
				if(model){
					console.log(fields[i].name+" "+values[i]);
						var fname=fields[i].name;
						var val=values[i];
					if(!Array.isArray(values)){
						model.findOneAndUpdate({doc_id:req.params.doc_id,name:fields[i].name},{value:values},null,function(err,doc){
							if(err)
								console.log("error while edit doc");

						});
					
					}else{
						
			model.findOneAndUpdate({doc_id:req.params.doc_id,name:fields[i].name},{value:values[i]},null,function(err,doc){
				if(err)
					console.log("error while edit doc");
				console.log("doc "+doc);
				if(doc==null){
					console.log("field name "+fname);
					var mm=new model({
						  name: fname,
						  table_id: req.params.tableid,
						  value: val,
						  doc_id: req.params.doc_id
					});
					mm.save(function(err){
					if(err)
						return console.log("err");
					else
						console.log("added doc");
					});
				}
				console.log("doc "+doc);
			});
				}
				}
		}
		
		
		
		req.flash('success','Document Updated Successfully');
		res.redirect("/admin/tables/view/"+req.params.tableid);
		}
	});
	
});


router.get("/delete/:tableid/:doc_id",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	StringTable.deleteMany({ table_id:req.params.tableid,doc_id:req.params.doc_id}, function (err) {
	  if(err) console.log(err);
	
	NumberTable.deleteMany({ table_id:req.params.tableid,doc_id:req.params.doc_id}, function (err) {
	  if(err) console.log(err);

	DateTable.deleteMany({ table_id:req.params.tableid,doc_id:req.params.doc_id}, function (err) {
	  if(err) console.log(err);

	TimeTable.deleteMany({ table_id:req.params.tableid,doc_id:req.params.doc_id}, function (err) {
	  if(err) console.log(err);
	  
	DnTTable.deleteMany({ table_id:req.params.tableid,doc_id:req.params.doc_id}, function (err) {
	  if(err) console.log(err);
	
	FileTable.deleteMany({ table_id:req.params.tableid,doc_id:req.params.doc_id}, function (err) {
	  if(err) console.log(err);
	  else{
		 
		  if (fs.existsSync('public/files/'+req.params.tableid+'/'+req.params.doc_id)) {
			  
		  try{
		fs.removeSync('public/files/'+req.params.tableid+'/'+req.params.doc_id);
		console.log("folder deleted");
		  }catch(err){console.log("folder not deleted");}
		  }
	  }
	  console.log("Successful deletion");
	
	   req.flash("success", "Document deleted");
	res.redirect("/admin/tables/view/"+req.params.tableid);
	});
	});
	});
	});
	});
	});
	}
});
//Exports
module.exports=router;