var express = require('express');
var app = express();

var mongoose = require('mongoose');
//var url = 'mongodb://localhost:27017/data/db'; 
var url = process.env.MONGOLAB_URI;

mongoose.connect(url);

var urlSchema = mongoose.Schema({
    shortcut: String,
    url: String
});
var Shortcut = mongoose.model("Shortcut", urlSchema);

function getRandpath(){
  var path="";
  for(var x=1; x<=4; x++){
    while(true){
      var num=Math.floor(Math.random() * (122-49)) + 49;
      var bad = ((num>=58 && num <=64) || (num>=91 && num <=96) || num==111 || num==79);
      if(!bad)break;
    }
    path+=String.fromCharCode(num);
  }
  return path;
}

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/index.html');
});

function checkurl(u){
  var template = "/new/http://www.";
  var rest=u.slice(16);
  var f11=u.slice(0,16);
  return (f11===template && checkend(rest));
}

function checkend(rest){
  var len=rest.length;
  return ((len>=6) && (rest[len-3]=="." || rest[len-4]=="." || rest[len-5]==".")) ;
}

app.get('*', function (req, res) {
  var newurl = req.params["0"];
   //res.json({url: newurl, length: newurl.length});

  var something= getRandpath();
  if(newurl.slice(0,4) != '/new'){
    //trying to go to a shortcut
    if(newurl.length !=5)
    res.json({url: "Are you looking for a shortcut?  If so, they are only 4 characters long.  If you want to make a NEW shortcut you need to start with /new/http://"});
    else{
      //look for shortcut
      Shortcut.findOne({shortcut: "https://fcc-urlshortener-martensclass.c9users.io" + newurl},function(err,sc){
        if(err) console.log(err);
        else if(!sc){
           res.json({url: "Sorry, the shortcut " + newurl + " does not exist."});
        }
        else{
          res.redirect(sc.url);
        }
      });
    }
  }
  else{ //try to create a new shortcut
    if(checkurl(newurl)){
        newurl = newurl.slice(5);
        var entry = new Shortcut({shortcut: "https://fcc-urlshortener-martensclass.c9users.io/" + something, url: newurl });
        entry.save(function(err,ent){
        if(err) console.log(err);
            else{
              res.json({shortcut: "https://fcc-urlshortener-martensclass.c9users.io/" + something, url: newurl});
           }
        });
    }
    else
        res.json({url: "invalid url - must start with: /new/http://www. and end with a properly formatted domain such as .com, .info, .io, .co.uk, .ca, etc.."});
        
  }
    
});



var port = process.env.PORT || 8080;

app.listen(port,  function () {
	console.log('Node.js listening on port ' + port + '...');
});