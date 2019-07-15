module.exports = function (app, db) {
    const path = require('path');
    var ObjectID = require("mongodb").ObjectID;
    var multer = require('multer');
    const userdetails = "clnuserdetails";
    const rolesCollection = "clnrolesCollection"
    const formidable = require('formidable');
    var multiparty = require('multiparty');
    const uniqid = require('uniqid');
    const CLN_IMAGE = "clnImage"
    const sharp = require('sharp')
    const user_assigned_doc = "clnuser_assigned_doc"
    var async = require('async');
    //login admin
    app.post('/login', (req, res) => {

        console.log(req.body, "thats suceesss")
        let data = req.body
        if ((!data.username) || (!data.password)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let datas = {
                "username": data.username,
                "password": data.password
            }


            db.collection(rolesCollection).find(datas).toArray().then(data => {
                console.log("thats the admin data", data)
                if (data.length) {
                    res.status(200).json({ status: true, message: "login success", data: data })
                }
                else
                    res.status(200).json({ status: false, message: "invalid userd", data: data })
            })





        }

    })

    //admin role assign ----add user
    app.post('/roleSignup', (req, res) => {

        console.log(req.body, "thats suceesss")
        let data = req.body
        if ((!data.username) || (!data.password) || (!data.role)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let newData = {
                "username": data.username,
                "password": data.password,
                "role": data.role,
                "createdDate": new Date,
                "status": true
            }
            console.log("newdata", newData)
            db.collection(rolesCollection).insert(newData, (err, result) => {
                if (err) res.status(500).json({ status: false, message: "something went wrong" })
                else {
                    console.log(newData);

                    res.status(200).json({ status: true, message: "sign up successfull", newData })
                }
            })
        }

    })

    //

    //------------view roles user

    app.get('/viewRoles', (req, res) => {

        let datas = {
            "role": "user"
        }
        db.collection(rolesCollection).find(datas, {}).toArray().then(data => {
            if (data.length >= 0) {
                console.log("thats the assigned roles data", data)
                res.status(200).json({ status: true, message: "User details", data: data })
            }
            else {
                res.status(200).json({ status: false, message: "no user found", data: data })
            }

        })



    })
    //assign a task file to a user
    app.post('/assignTask', (req, res) => {
        let data = req.body;
        if ((!data.userId) || (!data.imageId)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let newData = {
                "userId": data.userId,
                "imageId": data.imageId,
                "createdDate": new Date
            }
            db.collection(user_assigned_doc).insert(newData, (err, result) => {
                if (err) res.status(500).json({ status: false, message: "something went wrong" })
                else {


                    res.status(200).json({ status: true, message: "Task assigned " })
                }
            })
        }
    })

    //assign a task to all the users
    app.post('/assignTaskAllRoles', (req, res) => {
        let datar = req.body;
        if (!datar.imageId) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let datas = {
                "role": "user"
            }
            db.collection(rolesCollection).find(datas, {}).toArray().then(data => {
                if (data.length >= 0) {
                    console.log("thats the assigned roles data", data)
                    async.forEach(Object.keys(data), function (item, callback) {
                       
                        let questionData = data[item];
                        console.log(data,"AAAAAAAAA",questionData)
                    })

                       
                    


                    // db.collection(user_assigned_doc).insert(newData, (err, result) => {
                    //     if (err) res.status(500).json({ status: false, message: "something went wrong" })
                    //     else {


                    //         res.status(200).json({ status: true, message: "Task assigned to all the user" })
                    //     }
                    // })

                }
                else {
                    console.log("there you go")
                }

            })
        }
    })
    app.post("/discuss-questions", (req, res, next) => {
        var discussQuestions = req.body;
        if ((!discussQuestions.userId) || (!discussQuestions.activeUserId)) res.json({ status: false, message: commonData.resMessages().msg1 });

        else {
            db.collection(ADDCOMMENT).distinct("questionId").then(result => {
                if (result) {
                    var responseData = [];
                    async.forEach(Object.keys(result), function (item, callback) {
                        let questionData = result[item];
                        console.log(questionData, "fg")
                        async.parallel([
                            function (callback) {
                                db.collection(QUESTION_COLLECTION).find({ "_id": ObjectID(questionData) }).toArray().then(data => callback(null, data)).catch(err => callback(err));
                            },
                            function (callback) {
                                db.collection(CLN_WEEKLY_QUESTION).find({ "_id": ObjectID(questionData) }).toArray().then(data => callback(null, data)).catch(err => callback(err));
                            },
                        ],
                            function (err, resultResponse) {
                                if (err) callback(err)
                                else {
                                    if (typeof resultResponse[0][0] !== 'undefined') responseData.push(resultResponse[0][0]);
                                    if (resultResponse[1].length > 0) responseData.push(resultResponse[1][0]);

                                    callback();
                                }
                            });
                    }, (err) => {
                        if (err) handleError(res, "Invalid data", err, 400);
                        else return void res.json({ status: true, data: responseData });
                    })
                }
            }).catch(err => {
                errorBlock(res, "erro cant fetch question");
            })
        }
    })

    //view task assigned to the user 

    app.post('/viewTask', (req, res) => {
        let data = req.body;
        console.log(data, '>>>>>>>')
        if ((!data.userId) || (!data.role)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            if (data.role === "admin") {
                var newData = {

                }

            } else {
                var newData = {
                    "userId": data.userId
                }
            }

            db.collection(user_assigned_doc).find(newData, {}).toArray().then(data => {
                if (!data) res.status(500).json({ status: false, message: "no data found" })
                else {
                    res.status(200).json({ status: true, message: "Displaying the tasks assigned", data })
                }
            })
        }
    })



    //upload image
    app.post("/upload-image", function (req, res, next) {
        var form = new formidable.IncomingForm();
        let activeUserId = '';

        form.parse(req, function (err, fields, files) { activeUserId = fields.activeUserId });
        form.on('error', function (err) {
            res.status(200).json({ status: true, message: "Required parameter does not exist" })
        });
        form.on('end', function (fields, files) {
            if (this.openedFiles.length <= 0) res.status(200).json({ status: true, message: "Image upload failed" })
            else {
                let temp_path = this.openedFiles[0].path;
                console.log("temp path", temp_path)
                let fileName = this.openedFiles[0].name;

                var dirctory = '../public/images/'

                fileName = fileName.split('.');
                let fileUniqueName = uniqid();
                console.log("unique image id", fileUniqueName)
                sharp(temp_path)
                    .toFile(path.join(__dirname, dirctory + fileUniqueName), function (err) {
                        if (err) errorBlock(res, err, 'Error while resizing image')
                        else {
                            let inserdata = {
                                imageId: fileUniqueName,
                                created_date: new Date(),
                                updated_date: new Date(),
                                deleted_date: null,
                                status: 1

                            }
                            db.collection(CLN_IMAGE).insert(inserdata);
                            res.status(200).json({ status: true, message: "Image uploaded success", data: { imageId: fileUniqueName } })

                        }
                    })


            }




        });
    });







}

