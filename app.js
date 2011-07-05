
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
  blob: Number
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


function displayStack(stack, status, res) {
  console.log(stack);
  
  res.render('index', {
    title: 'MongoPop',
    status: status,
    items: stack.items
  });
}

function popTopItem (stack) {
  console.log(stack);
  stack.items[0].remove();

  console.log("\n");
  
  stack.save( function (err, stack) {
    if (err) throw err;
    console.log("removal persisted to mongodb");
    console.log(stack);
    mongoose.disconnect();
  });
}

function addNewItem(stack, res) {
  
}
// Routes

app.get('/', function(req, res){
  
  Stack.findOne({name:'The Stack'}, function (err, stack) {
    if (err) throw err;
    
    if (!stack) {
      return Stack.create({name: 'The Stack'}, function (err, stack) {
        if (err) throw err;
        displayStack(stack, 'Created new "The Stack"', res);
      });
    }
    
    return displayStack(stack, 'Used existing "The Stack"', res);
  });

});

app.get('/push', function(req, res){
  Stack.findOne({name:'The Stack'}, function (err, stack) {
    if (err) throw err;
    
    if (stack) {
      return addRandomItem(stack, res);
    }
  });
});

app.get('/pop', function(req, res){
  Stack.findOne({name:'The Stack'}, function (err, stack) {
    if (err) throw err;

    if (!stack) {
      return popTopItem(stack);
    }
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
