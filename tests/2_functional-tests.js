/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      let likes;
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         //  {"stockData":{"stock":"GOOG","price":"786.90","likes":1}}
          assert.equal(res.status, 200);
         assert.property(res.body, 'stockData');
         assert.propertyVal(res.body.stockData, 'stock', 'goog');
         assert.property(res.body.stockData, 'price');
         assert.property(res.body.stockData, 'likes');
         done();
          //complete this one too
          
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: "true"})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.propertyVal(res.body.stockData, 'stock', 'goog');
         assert.property(res.body.stockData, 'price');
         assert.property(res.body.stockData, 'likes');
          assert.isAbove(res.body.stockData.likes, 0);
          likes = res.body.stockData.likes;

          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: 'true'})
        .end( function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.propertyVal(res.body.stockData, 'stock', 'goog');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          assert.equal(res.body.stockData.likes, likes);
          
          done();
        });

      });
      
      let rel_likes;
      
      test('2 stocks', function(done) {
        // response {"stockData":[{"stock":"MSFT","price":"62.30","rel_likes":-1},{"stock":"GOOG","price":"786.90","rel_likes":1}]}
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['aapl', 'msft']})
        .end( function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2);
          assert.isObject(res.body.stockData[0]);
          assert.propertyVal(res.body.stockData[0], 'stock', 'aapl');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.isObject(res.body.stockData[1]);
          assert.propertyVal(res.body.stockData[1], 'stock', 'msft');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.equal(res.body.stockData[0].rel_likes+res.body.stockData[1].rel_likes, 0);
          rel_likes = Math.abs(res.body.stockData[0].rel_likes);
          done();
        });
        
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['aapl', 'msft'], like: 'true' })
        .end(function(err, res){
          assert.equal(res.status, 200);
          console.log(res.body);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData);
          assert.equal(res.body.stockData.length, 2);
          assert.isObject(res.body.stockData[0]);
          assert.propertyVal(res.body.stockData[0], 'stock', 'aapl');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.isObject(res.body.stockData[1]);
          assert.propertyVal(res.body.stockData[1], 'stock', 'msft');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'rel_likes');
          assert.equal(res.body.stockData[0].rel_likes+res.body.stockData[1].rel_likes, 0);
          assert.oneOf(Math.abs(res.body.stockData[0].rel_likes), [rel_likes, rel_likes+1]);
          
          done();
        });
      });
      
    });

});
