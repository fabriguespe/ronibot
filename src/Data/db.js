var MongoClient = require('mongodb').MongoClient;

var DbConnection = function () {

    var db = null;
    var instance = 0;

    async function DbConnect() {
        try {
            const uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000";
            let _db = await MongoClient.connect(uri);

            return _db.db("ronimate");
        } catch (e) {
            return e;
        }
    }
    

   async function Get() {
        try {
            instance++;     // this is just to count how many times our singleton is called.
            //console.log(`DbConnection called ${instance} times`);

            if (db != null) {
                console.log(`db connection is already alive`);
                return db;
            } else {
                //console.log(`getting new db connection`);
                db = await DbConnect();
                return db; 
            }
        } catch (e) {
            return e;
        }
    }

    return {
        Get: Get
    }
}


module.exports = DbConnection();