
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/mongopop');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var StackSchema = new Schema({
  name: String
  ,items: [StackItemSchema]
});

var StackItemSchema = new Schema({
  date: Date
  ,blob: Number
});

var Stack = mongoose.model('Stack', StackSchema);



// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  
  Stack.find({name:'The Stack'}, function (err, docs) {
    var the_stack;
    var status;
    if (!docs.length) {      
      the_stack = new Stack({name: 'The Stack'});
      the_stack.save();
      
      status = "Created The Stack";
    } else {
      the_stack = docs[0];
      status = "Used a prexisting The Stack"
    }
    console.log(the_stack.items)
    
    res.render('index', {
      title: 'MongoPop',
      status: status
    });
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
