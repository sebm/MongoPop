
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer();

var mongoose = require('mongoose');

var connectionString = process.env.MONGOLAB_URI || process.env.MONGO_URI || 
  'mongodb://' + process.env.MONGOPOP_MONGO_USER + ':' + 
  process.env.MONGOPOP_MONGO_PW + '@' + process.env.MONGOPOP_MONGO_URL ;

var db = mongoose.connect(connectionString);
console.log('Using connection string ' + connectionString);

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
  var currentPath = res.req.route.path;
  
  var links = {
    "/" : 'View the List',
    "/push" : "Push",
    "/pop" : "Pop"
  };
  
  res.render('index', {
    title: 'MongoPop',
    links: links,
    status: status,
    items: stack.items,
    currentPath: currentPath
  });
}

function popTopItem (stack,callback) {
  var theBlob = stack.items[0].blob;
  
  stack.items = stack.items.splice(stack.items.length-1, stack.items.length);
  
  stack.save( function (err, stack) {
    if (err) throw err;
    callback(theBlob);
  });
}

function addRandomItem(stack, callback) {
  var randomNumber = Math.random();
  console.log(stack);
  stack.items.push({ blob: randomNumber });
  stack.save(function(err, stack){
    if (err) throw err;
    callback(randomNumber);
  });
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
      return addRandomItem(stack, function(num){
        displayStack(stack, 'Pushed '+ num +' onto The Stack', res);
      });
    }
  });
});

app.get('/pop', function(req, res){
  Stack.findOne({name:'The Stack'}, function (err, stack) {
    if (err) throw err;
    
    if (stack && stack.items.length) {
      return popTopItem(stack, function(num) {
        displayStack(stack, 'Popped ' + num + ' off The Stack', res);
      });
    } else {
      return displayStack(stack, 'Empty Stack!', res);
    }
  });
});

var port = process.env.PORT || 8080;

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
