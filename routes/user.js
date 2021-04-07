var express=require("express");
var router=express.Router();

var User=require("../models/user");

router.get("/login",function(req,res){
	
	if(res.locals.user) res.redirect('/');
	res.render('login',{
		title:"Log in"
	});
});


router.post("/login",function(req,res){
	
	var username=req.body.username;
	var pass=req.body.pass;
	
		User.findOne({username:username,pass:pass},function(err,user){
			
			
			if(user)
			{
				console.log("login user : "+user);
				req.app.locals.user=user;
				res.redirect("/");
			}
			else
			{
				
				req.flash('danger',"User does not exist.");
				res.render("login",{
					title:"Log in"
				});
			}
		});
	
});

router.get("/logout",function(req,res){
		
		req.flash('success',"Successfully logged out.");
		req.app.locals.user=null;
		req.session=null;
		res.redirect("/user/login");
		
	
});


module.exports=router;