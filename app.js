var express=require("express");
var path=require("path");
var mongoose=require("mongoose");
var config=require("./config/database");
var bodyParser=require("body-parser");
var session=require("express-session");
var flash=require("connect-flash");
const expressValidator = require('express-validator');
var fileupload=require('express-fileupload');

//Connect to db
mongoose.connect(config.database, {useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true});
var db=mongoose.connection;
db.on("error",console.error.bind(console,"connection error"));
db.once("open",function(){
	console.log("Connected to MongoDB");
});


/* // Use connect method to connect to the Server
client.connect(function(err) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  const database = client.db(config.dbName);
  
   */




//init app
var app=express();

//set up view engine
app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

//set up public folder
app.use(express.static(path.join(__dirname,"public")));



//set errors as global variable
app.locals.errors=null;

//set list of dynamic tables generated
app.locals.user=null;

var Page=require("./models/page");


//get all pages to pass to header.ejs
Page.find({}).sort({sorting:1}).exec(function(err,pages){
		if(err){
			console.log("error");
		} else {
			app.locals.pages=pages;
		}
	});

//fileupload use
app.use(fileupload());

//express session middleware
app.use(session({
  secret: 'secret-code',
  resave: true,
  saveUninitialized: true
}));


//body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
 

//express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});



//set routes
var pages=require("./routes/pages.js");
var adminPages=require("./routes/admin_pages.js");
var adminSubpages=require("./routes/admin_subpages.js");
var adminTable=require("./routes/admin_table.js");
var user=require("./routes/user.js");

app.use("/user",user);

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

app.use("/admin/pages",adminPages);
app.use("/admin/sub-pages",adminSubpages);
app.use("/admin/tables",adminTable);

app.get("/admin",function(req,res){
	if(!req.app.locals.user)
		res.redirect("../../");
	else{
	res.render("admin/home",{
		title:"Admin Home"
	});
	}
});


app.use("/",pages);



//start server
var port =3000;
app.listen(port,function(){
	console.log("Server started on port "+port);
});

/* }); */