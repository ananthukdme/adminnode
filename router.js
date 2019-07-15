module.exports =function(app,db){
   
    require('./service/admin')(app, db);
}