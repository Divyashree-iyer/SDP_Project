var express=require("express");
var router=express.Router();
const { check, validationResult } = require('express-validator');
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

//get file table
var FileTable=require("../models/table_type_file");


//GET request from /
router.get("/",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../");
	else{
	Subpage.find(function(err,subpages){
		res.render('admin/sub_pages',{
			title:"Subpage",
			subpages:subpages
		});
	});
	}
});


//Get add page
router.get("/add-subpage",check('title','Title must have a value.').not().isEmpty(),
    check('content',"Content must not be empty").not().isEmpty(),function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	var title="";
	var slug ="";
	var content='';
	var table_name='';
	
	Page.find(function(err,pages){
		res.render('admin/add_subpage',{
			title:title,
			slug:slug,
			content:content,
			pages:pages,
			table_name:table_name
		});
	});
	}
});

//POST add page
router.post("/add-subpage",check('title','Title must have a value.').not().isEmpty(),
    check('content',"Content must not be empty").not().isEmpty(),function(req,res){

	var img,imgName;
	if(!req.files){
		img="";
		imgName="";
	}
	else{
		imgName=req.files.img.name;
		img=req.files.img;
	}
	console.log("image: "+imgName);
	
	var title=req.body.title;
	var slug =req.body.slug.replace(/\s/g,'-').toLowerCase();
	var content=req.body.content;
	var page=req.body.page;
	if(slug=="") slug=title.replace(/\s/g,'-').toLowerCase();
	var table_name=req.body.table_name;
	console.log(table_name);
	
	errors=validationResult(req);
	console.log(errors.array().length);
	if(errors.array().length>0){
		console.log(errors.array());
	
		res.render('admin/add_subpage',{
			title:title,
			slug:slug,
			content:content,
			page:page,
			img:img,
			table_name:table_name,
			errors:errors.array()
		});
	
	}
	else{
	if(table_name!=null){
		var pkey=req.body.pkey;
		var field_names=new Array();
		var field_types=new Array();		//text, number, date, time, datetime-local
		var field_num=req.body.fieldNum;
		console.log(field_num);
		var name=req.body.name;
		var type=req.body.type;  
		if(field_num==1){
			field_names.push(name);
			field_types.push(type);
		}
		else{
		for(var i=0;i<field_num;i++)
		{
			
			field_names.push(name[i]);
			field_types.push(type[i]);
		}
		}
		var table=new Table({
			id:slug+"-"+table_name,
			name:table_name
		});
		table.save(function(err){
					if(err)
						return console.log("err");
					else
						console.log("added table");
				});
				
		for(var i=0;i<field_num;i++)
		{
			var x;
			if((pkey-1)==i)
				x=true;
			else 
				x=false;
			var field=new Field({
				table_id:slug+"-"+table_name,
				name:field_names[i],
				datatype:field_types[i],
				key:x
			});
			field.save(function(err){
						if(err)
							return console.log("err");
						else
							console.log("added fields");
					});
		}
	
	}
	
	
	Subpage.findOne({slug:slug},function(err,subpage){
		if(subpage){	
			req.flash('danger',"Subpage exists");
			res.render('admin/add_subpage',{
			title:title,
			slug:slug,
			content:content,
			page:page,
			img:img,
			table_name:table_name
			
		});
		}
		
		else{
			var subpage=new Subpage({
				title:title,
				slug:slug,
				content:content,
				page:page,
				img:imgName,
				table_name:table_name
			});
			console.log(subpage);
			subpage.save(function(err){
				if(err)
					return console.log("err in saving subpage");
				
				var fpath="public/images/"+subpage.slug;
				
				if(imgName!="")
				{
					fs.mkdirSync(fpath, { recursive: true })
					
					
						console.log("folder made");
						var Image=img;
					var path=fpath+"/"+imgName;
					
					Image.mv(path,function(err){
						if(err)
							console.log(err);
						else
							console.log("img uploaded");
						});
					
					
					
				
				}
				req.flash('success','Subpage added');
				res.redirect('/admin/sub-pages');
			});
		}
	});
	
        }
});



//Get edit page
router.get("/edit-subpage/:slug",check('title','Title must have a value.').not().isEmpty(),
    check('content',"Content must not be empty").not().isEmpty(),function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	var pkey;
	Subpage.findOne({slug:req.params.slug},function(err,p){
		if(err)
			return console.log("error while finding subpage");
		if(p){
			var fpath="/images/"+p.slug+"/"+p.img;
			if(p.table_name){
				var tableid=p.slug+"-"+p.table_name;
				var fieldnames=[],fieldtypes=[];
				Field.find({table_id:tableid},function(err,fields){
					for(var i=0;i<fields.length;i++){
						fieldnames.push(fields[i].name);
						fieldtypes.push(fields[i].datatype);
						if(fields[i].key==true)
							pkey=fields[i].name;
					}
					res.render('admin/edit_subpage',{
						page:p.page,
						title:p.title,
						slug:p.slug,
						content:p.content,
						imgSrc:fpath,
						img:p.img,
						id:p._id,
						table_name:p.table_name,
						name:fieldnames,
						type:fieldtypes,
						pkey:pkey
					});				
				});
			}
			else{
				res.render('admin/edit_subpage',{
						page:p.page,
						title:p.title,
						slug:p.slug,
						content:p.content,
						img:p.img,
						imgSrc:fpath,
						id:p._id,
						table_name:p.table_name,
						name:"",
						type:""
						
					});
			}
		}
	});
	}
});

//POST edit page
router.post("/edit-subpage/:slug",check('title','Title must have a value.').not().isEmpty(),
    check('content',"Content must not be empty").not().isEmpty(),function(req,res){
	
	errors=validationResult(req);

	if(errors.array().length>0){
		Subpage.findOne({slug:req.params.slug},function(err,p){
		if(err)
			return console.log("error while finding subpage");
		if(p){
			var fpath="/images/"+p.slug+"/"+p.img;
			if(p.table_name){
				var tableid=p.slug+"-"+p.table_name;
				var fieldnames=[],fieldtypes=[];
				Field.find({table_id:tableid},function(err,fields){
					for(var i=0;i<fields.length;i++){
						fieldnames.push(fields[i].name);
						fieldtypes.push(fields[i].datatype);
						if(fields[i].key==true)
							pkey=fields[i].name;
					}
					fieldnames.concat(req.body.name);
					fieldtypes.concat(req.body.type);
					res.render('admin/edit_subpage',{
						page:req.body.page,
						title:req.body.title,
						slug:req.body.slug,
						content:req.body.content,
						imgSrc:fpath,
						img:p.img,
						id:p._id,
						table_name:req.body.table_name,
						name:fieldnames,
						type:fieldtypes,
						pkey:pkey,
						errors:errors.array()
					});				
				});
			}
		}
		});
	}
	else{
		
	var img,imgName;
	if(!req.files){
		img="";
		imgName="";
	}
	else{
		imgName=req.files.img.name;
		img=req.files.img;
	}
	var title=req.body.title;
	var slug =req.body.slug.replace(/\s/g,'-').toLowerCase();
	var content=req.body.content;
	var page=req.body.page;
	if(slug=="") slug=title.replace(/\s/g,'-').toLowerCase();
	var id=req.body.id;
	var table_name=req.body.table_name;
	var fieldnames=req.body.name;
	var fieldtypes=req.body.type;
	
	Subpage.findOne({slug:slug,_id:{'$ne':id}},function(err,sp){
		
		
		if(sp){	
			req.flash('danger',"subPage does not exists");
			res.render('admin/edit_subpage',{
				page:page,
				title:title,
				slug:slug,
				content:content,
				img:img,
				id:id,
				table_name:table_name,
				name:"",
				type:"",
				imgSrc:""
						
			});
		}
		else{
			Subpage.findById(id,function(err,p){
				
				if(err)
					return console.log("error edit page find");
				p.title=title;
				p.slug=slug;
				p.page=page;
				p.content=content;
				
				if(imgName!="")
				{
				var oldImage=p.img;
				p.img=imgName;
				}
				var rpath="public/images/"+p.slug+"/"+oldImage;
				var fpath="public/images/"+p.slug;
				console.log("old img name"+oldImage);
				
						
				if(imgName!="")
				{
					if(oldImage!=""){
					try {
					  fs.removeSync(rpath);
					  console.log("old img removed");
					} catch(err) {
					  console.error(err)
					  console.log("could not remove old img");
					}
					}else {
						fs.mkdirSync(fpath, { recursive: true })
						console.log("folder made");
					}
					var Image=img;
					var path=fpath+"/"+imgName;
					
					Image.mv(path,function(err){
						if(err)
							console.log(err);
						else{
							console.log("img uploaded");
							x=1;
						}
					});
					
				}
				
				if(table_name!=""){

					var tableid=p.slug+"-"+p.table_name;
					var newtableid = p.slug + "-" + table_name;
					Table.findOne({id:tableid},function(err,t){

							Field.find({ table_id : tableid },function (err , f){
								for(var i = 0 ; i < f.length ; i++)
								{
									f[i].table_id = newtableid;
									f[i].save(function(err){});
								}
								
							});
							StringTable.find({ table_id : tableid },function (err , f){
								for(var i = 0 ; i < f.length ; i++)
								{
									f[i].table_id = newtableid;
									f[i].save(function(err){});
								}
								
							});
							NumberTable.find({ table_id : tableid },function (err , f){
								for(var i = 0 ; i < f.length ; i++)
								{
									f[i].table_id = newtableid;
									f[i].save(function(err){});
								}
								
							});
							DateTable.find({ table_id : tableid },function (err , f){
								for(var i = 0 ; i < f.length ; i++)
								{
									f[i].table_id = newtableid;
									f[i].save(function(err){});
								}
								
							});
							TimeTable.find({ table_id : tableid },function (err , f){
								for(var i = 0 ; i < f.length ; i++)
								{
									f[i].table_id = newtableid;
									f[i].save(function(err){});
								}
								
							});
							DnTTable.find({ table_id : tableid },function (err , f){
								for(var i = 0 ; i < f.length ; i++)
								{
									f[i].table_id = newtableid;
									f[i].save(function(err){});
								}
								
							});
							FileTable.find({ table_id : tableid },function (err , f){
								for(var i = 0 ; i < f.length ; i++)
								{
									f[i].table_id = newtableid;
									f[i].save(function(err){});
								}
								
							});


						if(t){
						t.name=table_name;
						t.id = newtableid;
						t.updatedAt=Date.now();
						t.save(function(err){});
						console.log("found table");
						if(fieldnames){
							console.log("new entry: "+fieldnames);
							console.log("new entry: "+fieldtypes);
							console.log("new entry: "+fieldnames.length);
							console.log("array check : "+Array.isArray(fieldnames));
							if( Array.isArray(fieldnames)){
								for(var i=0;i<(fieldnames.length);i++){
									var f=new Field({
										table_id:newtableid,
										name:fieldnames[i],
										datatype:fieldtypes[i]
									});
									console.log("array : "+f);
									f.save(function(err){
										if(err)
											console.log(err);
									});
								}
							}
							else{
								var f=new Field({
									table_id:newtableid,
									name:fieldnames,
									datatype:fieldtypes
								});
								console.log("not array : "+f);
								f.save(function(err){
									if(err)
										console.log(err);
								});
							}
						}
						}
						else{
							var pkey=req.body.pkey;
							var table=new Table({
								id:newtableid,
								name:table_name
							});
							table.save(function(err){
								if(err)
									console.log("err while saving table in edit subpage");
								else{
									if( Array.isArray(fieldnames)){
										for(var i=0;i<(fieldnames.length);i++){
											var x;
												if((pkey-1)==i)
													x=true;
												else 
													x=false;
											var f=new Field({
												table_id:newtableid,
												name:fieldnames[i],
												datatype:fieldtypes[i],
												key:x
											});
											console.log(f);
											f.save(function(err){
												if(err)
													console.log(err);
											});
										}
									}
									else{
										var f=new Field({
											table_id:newtableid,
											name:fieldnames,
											datatype:fieldtypes,
											key:true
										});
										console.log(f);
										f.save(function(err){
											if(err)
												console.log(err);
										});
									}
								}
							});
						}
					});
					p.table_name=table_name;
				}
					console.log("subpage end : "+p);
					p.save(function(err){
						if(!err)
							console.log("subpage saved");
					});
					req.flash('success','Page updated');
					res.redirect('/admin/sub-pages');
				
			});
		}
	});
	}
});

//GET delete page
router.get("/delete-subpage/:id",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
		Subpage.findByIdAndRemove(req.params.id,function(err,subpage){
			if (fs.existsSync('public/images/'+subpage.slug)) {
				try{
				fs.removeSync('public/images/'+subpage.slug);
				console.log("folder deleted");
				}catch(err){console.log("folder not deleted");}
			}
			var tableid=subpage.slug+"-"+subpage.table_name;
			
		DateTable.deleteMany({ table_id:tableid}, function (err) {
		  if(err) console.log(err);

		TimeTable.deleteMany({ table_id:tableid}, function (err) {
		  if(err) console.log(err);
		  
		DnTTable.deleteMany({ table_id:tableid}, function (err) {
		  if(err) console.log(err);
		
		FileTable.deleteMany({ table_id:tableid}, function (err) {
		  if(err) console.log(err);
		  else{
			 
			  if (fs.existsSync('public/files/'+tableid)) {
				  
			  try{
			fs.removeSync('public/files/'+tableid);
			console.log("folder deleted");
			  }catch(err){console.log("folder not deleted");}
			  }
		  }
		 
		StringTable.deleteMany({ table_id:tableid}, function (err) {
		  if(err) console.log(err);
		 
		NumberTable.deleteMany({ table_id:tableid}, function (err) {
		  if(err) console.log(err);
		  
		Field.deleteMany({ table_id:tableid}, function (err) {
		  if(err) console.log(err);
		  
		Table.deleteMany({ id:tableid}, function (err) {
		  if(err) console.log(err);
		  
		 	req.flash("success", "Subpage deleted");
		res.redirect("/admin/sub-pages");
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



//Exports
module.exports=router;