const mongoose = require('mongoose');
const Content = require('../models/content');
const csvtojson = require('csvtojson');
const mongodb = require('mongodb');

var url = 'mongodb://localhost:27017/prati-lipi';

var dbConn;
mongodb.MongoClient.connect(url, {
    useUnifiedTopology: true,
}).then((client) => {
    console.log("DB Connected!");
    dbConn = client.db();
}).catch(err => {
    console.log("DB Connection Error: ${err.message}");
});

const filename = "sample.csv";


var arrayToInsert = [];
csvtojson().fromFile(filename).then(source => {
for(var i = 0; i < source.length; i++){
    var oneRow = {
        title : source[i]['title'],
        story : source[i]['story'],
        image : 'https://images.unsplash.com/photo-1543635343-fd6e563d12da?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MjZ8ODQzOTUwNXx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60'
    };
    arrayToInsert.push(oneRow);
}
var collectionName = 'contents';
var collection = dbConn.collection(collectionName);
collection.insertMany(arrayToInsert, (err, result) => {
         if (err) console.log(err);
         if(result){
             console.log("Import CSV into database successfully.");
         }
    });
})



