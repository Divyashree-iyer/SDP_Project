var express=require("express");
var router=express.Router();
const { check, validationResult } = require('express-validator/check');
const mongoose=require("mongoose");
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
	console.log(req.app.locals.user);
	if(!req.app.locals.user)
		res.redirect("../../");
	else{
	Page.find({}).sort({sorting:1}).exec(function(err,pages){
		res.render('admin/pages',{
			title:"Pages",
			pages:pages
		});
	});
	}
});



//Get add page
router.get("/add-page",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	var title="";
	var slug ="";
	var content='';
	
	res.render('admin/add_page',{
		title:title,
		slug:slug,
		content:content
		
	});
	
	}
});

//POST add page
router.post("/add-page",check('title','Title must have a value.').not().isEmpty(),
    check('content',"Content must not be empty").not().isEmpty(),function(req,res){
	
	var title=req.body.title;
	var slug =req.body.slug.replace(/\s/g,'-').toLowerCase();
	var content=req.body.content;
	if(slug=="") slug=title.replace(/\s/g,'-').toLowerCase();
	
	errors=validationResult(req);
	console.log(errors.array().length);
	if(errors.array().length>0){
		console.log(errors.array());
		
		res.render('admin/add_page',{
			errors:errors.array(),
			title:title,
			slug:slug,
			content:content
		});
	}
	
	Page.findOne({slug:slug},function(err,page){
		if(page){	
			req.flash('danger',"Page exists");
			res.render('admin/add_page',{
			title:title,
			slug:slug,
			content:content
			
		});
		}
		else{
			var page=new Page({
				title:title,
				slug:slug,
				content:content,
				sorting:100
			});
			console.log(page);
			page.save(function(err){
				if(err)
					return console.log("err");
				Page.find({}).sort({sorting:1}).exec(function(err,pages){
					if(err){
						console.log("error");
					} else {
						req.app.locals.pages=pages;
					}
				});

				req.flash('success','Page added');
				res.redirect('/admin/pages');
			});
		}
	});
	
	
	
	
});



//Get edit page
router.get("/edit-page/:slug",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	
	Page.findOne({slug:req.params.slug},function(err,page){
		if(err)
			return console.log("error while finding page");
		
		
		res.render('admin/edit_page',{
			title:page.title,
			slug:page.slug,
			content:page.content,
			id:page._id
			
		});
	});
	}
});

//POST edit page
router.post("/edit-page/:slug",check('title','Title must have a value.').not().isEmpty(),
    check('content',"Content must not be empty").not().isEmpty(),function(req,res){
	
	
	var title=req.body.title;
	var slug=req.body.slug;
	console.log(slug);
	if(slug!=undefined)
		slug =slug.replace(/\s/g,'-').toLowerCase();
	var content=req.body.content;
	if(slug=="") slug=title.replace(/\s/g,'-').toLowerCase();
	var id=req.body.id;
	
	
	errors=validationResult(req);
	console.log(errors.array().length);
	if(errors.array().length>0){
		console.log(errors.array());
	
		res.render('admin/edit_page',{
			title:title,
			slug:slug,
			content:content,
			id:id,
			errors:errors.array()
		});
	
	}
	Page.findOne({slug:slug,_id:{'$ne':id}},function(err,page){
		if(page){	
			req.flash('danger',"Page exists");
			res.render('admin/edit_page',{
			title:title,
			slug:slug,
			content:content,
			id:id
		});
		}
		else{
			Page.findById(id,function(err,page){
				if(err)
					return console.log("error edit page find");
				page.title=title;
				if(page.slug!="home")
					page.slug=slug;
				page.content=content;
				page.save(function(err){
					if(err)
						return console.log("err");
					Page.find({}).sort({sorting:1}).exec(function(err,pages){
					if(err){
						console.log("error");
					} else {
						req.app.locals.pages=pages;
					}
				});
					req.flash('success','Page updated');
					res.redirect('/admin/pages');
				});
			});
			
		}
	});
	
	
});

//GET delete page
router.get("/delete-page/:id",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../../");
	else{
	Page.findByIdAndRemove(req.params.id, function(err,p){
		if(err){
			req.flash("danger", "Page could not be deleted");
			return;
		}
			Subpage.find({page:p.slug},function(err,subpages){
				console.log("subpage info : "+subpages);
				var subpageSlug=[];
				if(subpages){
			subpages.forEach(function(subpage){
				subpageSlug.push(subpage.slug);
			var tableid=subpage.slug+"-"+subpage.table_name;
			console.log("table id : "+tableid);
			DateTable.deleteMany({ table_id:tableid}, function (err) {
			  if(err) console.log(err);
				console.log(" deleted");
			TimeTable.deleteMany({ table_id:tableid}, function (err) {
			  if(err) console.log(err);
			  console.log(" deleted");
			DnTTable.deleteMany({ table_id:tableid}, function (err) {
			  if(err) console.log(err);
			console.log(" deleted");
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
			  console.log(" deleted");
			Table.deleteMany({ id:tableid}, function (err) {
			  if(err) console.log(err);
			  console.log(" deleted");
			
		});
		});
		});
		});
		});
		});
		});
		});
			});	
			Subpage.deleteMany({page: p.slug},function(err){
				if(err)
					console.log("could not delete subpage");
				else{
					subpageSlug.forEach(function(slug){
						if (fs.existsSync('public/images/'+slug)) {
							try{
							fs.removeSync('public/images/'+slug);
							console.log("folder deleted");
							}catch(err){console.log("folder not deleted");}
						}
					});
					
				}
			});
			}
			});
	
		Page.find({}).sort({sorting:1}).exec(function(err,pages){
			if(err){
				console.log("error");
			} else {
				req.app.locals.pages=pages;
								
			}
		});
		
		req.flash("success", "Page deleted");
		res.redirect("/admin/pages");
	});
	}
});



//Exports
module.exports=router;