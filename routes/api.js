/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const request    = require('request');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  const stockApiPrice  = (ticker, done) => {
    // request online price from API
      request('https://api.iextrading.com/1.0/stock/'+ticker+'/price', function(err, apiRes){
        if(err ) return console.log('API err: '+err);
        if(apiRes.statusCode !== 200) return done('API err: '+apiRes.body+',  res.statusCode: '+apiRes.statusCode, null);
        
        return done(null, apiRes);
      });
  };
  
  const handleDbDoc    = (ticker, like, ip, apiRes, done) => {
  // find or create stock doc
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      db.collection('stocks')
      .findOneAndUpdate(
        {  stock: ticker },
        {  $setOnInsert: { stock: ticker, likes: [] } },
        {  upsert: true,
           returnOriginal: false },
        function(err, dbRes) {
          if(err) return console.log('Database findOneAndUpdate err: '+err);
          // if like is cheked and ip is not on the list add it to DB
          if(like == 'true' && !dbRes.value.likes.includes(ip) ){
            db.collection('stocks')
            .updateOne(
              {  _id: dbRes.value._id },
              {  $push: {  likes: ip } },
              function(err, ret){
                if(err) return console.log('Database updateOne err: '+err);

                return done(null, {stock: ticker, price: apiRes, likes: dbRes.value.likes.length+1 }) ;
              }
            );
          } 
          //else straight to response
          else {
                return done(null, {stock: ticker, price: apiRes, likes: dbRes.value.likes.length });
          }
        }
      );
    });
  };
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      const ticker = req.query.stock;
    // is ticker invalid
    if(ticker == undefined || ticker == '')
      return res.send('invalid stock ticker');
    var result;
    if(Array.isArray(ticker)){
      stockApiPrice(ticker[0], (err, apiRes_0) => {
        if(err) return res.send(err);
        
        handleDbDoc(ticker[0],req.query.like, req.ip, apiRes_0.body, (err, result_0) => {
          // second round
          stockApiPrice(ticker[1], (err, apiRes_1) => {
            if(err) return res.sedn(err);
            
            handleDbDoc(ticker[1], req.query.like, req.ip, apiRes_1.body, (err, result_1) => {
              return res.json({stockData: [{stock: result_0.stock, price: result_0.price, rel_likes: result_0.likes-result_1.likes},
                                           {stock: result_1.stock, price: result_1.price, rel_likes: result_1.likes-result_0.likes}
                                          ]});
            });
          });
        });
      });
     }
    else {
       // request online price from API
      stockApiPrice(ticker, function(err, apiRes){
        if(err ) return res.send(err);
      // handle db request
        handleDbDoc(ticker, req.query.like, req.ip, apiRes.body, function(err, result){
          return res.json({stockData: result});
        });
       });
    }
    });
    
};
