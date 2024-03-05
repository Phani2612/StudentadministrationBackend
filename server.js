const Express = require("express")

const CORS = require("cors")

const Mongoose = require('mongoose')

const Cookieparser = require('cookie-parser')

const JWT = require('jsonwebtoken')

const App = Express()

const path = require('path')

App.use(Cookieparser())

App.set("view engine" , "ejs")

App.use(Express.urlencoded())

App.use(CORS())

App.use(Express.json())

const Mycluster = require('cluster')

const OS = require('os')

const Corecount = OS.cpus().length

const Bcrypt = require('bcryptjs')

App.use(Express.static(path.join(__dirname, 'build')));

// Handle all other requests by serving the index.html file
App.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


Mongoose.connect("mongodb+srv://Phani2612:2612@cluster0.nxfzz84.mongodb.net/Studentdatabase?retryWrites=true&w=majority&appName=Cluster0")

// Mongoose.connect('mongodb://localhost:27017/Studentdatabase')

// Mongoose.connect('mongodb+srv://Phani2612:2612@cluster0.nxfzz84.mongodb.net/Studentdatabase?retryWrites=true&w=majority')


const StudentSchema = new Mongoose.Schema({

    name : {

        type : String,

        required : true,

        minLength : 3,

        maxLength : 50,

        
    },


    age : {

        type : Number,

        required : true

    },


    rollno : {

        type : Number,

        required : true,

        unique : true
    },


    city : {

        type : String,

        required : true,

        minLength : 3,

        maxLength : 50
    }

})


const Registerschema = new Mongoose.Schema({

    name:{
         type:String,
         unique : true
    },

    password:{
        type:String,
        unique : true
    }
})

const Registermodel = Mongoose.model('users', Registerschema)


const StudentModel = Mongoose.model('students' , StudentSchema)





function Verifytoken(req,res,next)
{
    let fetchedJWT = req.cookies.token

    console.log(fetchedJWT)

    if(!fetchedJWT)
    {
        res.redirect('/Login')
    }

    else{

        JWT.verify(fetchedJWT , "Welcome brother" , function(error)
        {
            if(error)
            {
                console.log(error)

            }

            else{

                next()
            }
        })
    }
}

App.post('/Register' , async function(req,res)
{
    const data = req.body

    console.log(data)

    let Myname = data.name

    let Password = data.password

    let Confirm = data.confirm

    const Hashedpassword = await Bcrypt.hash(Password,12)

    console.log(Hashedpassword)

    if(Password === Confirm)
    {
        const Userdata = new Registermodel({

            name:Myname,
            password:Hashedpassword
        })

        Userdata.save().then(function(output)
        {
            console.log(output)
        }).catch(function(error)
        {
            console.error(error)
        })

        res.send('Added successfully')
    }
})


App.post('/Login' , async function(req,res)
{
    const data = req.body
    const Myname = data.username
    
    // console.log(data)

    // console.log(JWTtoken)

    const Data = req.body
            

    const found = await Registermodel.findOne({name:Myname})

    // console.log(found)

    if(found != null)
    {
        const ActualPassword = found.password

        const Enteredpassword = data.password

        const confirmation = await Bcrypt.compare(Enteredpassword , ActualPassword)

        if(confirmation == true)
        {
            
            
            const JWTtoken = JWT.sign(Data , "Welcome brother" , {expiresIn: '2hr'})
            // console.log(JWTtoken)
            res.cookie('token', JWTtoken, { httpOnly: true });


            res.send(true)
        }

        else{

            res.send(false)
        }
        
        
    }

    else{

        res.send('register')
    }
})



App.get('/addstudent' ,  function(req,res)
{
    res.render("studentform.ejs")
})

App.post('/addstudent'     ,  function(req,res)
{
    let myName = req.body.name

    let myRoll = req.body.rollno

    let myAge = req.body.age

    let myCity = req.body.city




    const StudentData = new StudentModel({


        "name" : myName,

        "age" : myAge,

        'rollno' : myRoll,

        "city" : myCity


    })


    StudentData.save().then(function(output)
    {
        // res.send(`Data is successfully saved! ${output}`)

        res.send(`Data is successfully saved!`)

    }).catch(function(error)
    {
        res.send(`Data is not saved! please try again after some time! `)
    })

})








App.get('/Viewstudent'  , async function(req,res)
{

      const result = await StudentModel.find()

    //   console.log(result)

      res.send(result)

})

App.get('/check' , function(req,res)
{
      res.render('studentform.ejs')
})

App.get('/read/data/:id' ,  async function(req,res)
{
    const ID = req.params.id

    // console.log(ID)

    const StudentInfo = await StudentModel.find({'rollno' : ID})

    res.send(StudentInfo)

    // console.log(StudentInfo)
})

App.delete('/delete/data/:id', async function(req,res)
{
    const I = req.params.id

    // console.log(I)

    const Studentdata = await StudentModel.deleteOne({rollno : I})

    if(Studentdata.deletedCount == 0)
    {
        res.send("Deletion successfull")
    }

    else{

        res.send("Deletion not successfull")
    }

    
})


// App.get('/update/:id' , async function(req,res)
// {
//     const ID = req.params.id
//     console.log(ID)

//     const data = await StudentModel.find({rollno : ID})

//     res.send(data)
// })


App.patch('/Update/:id' ,  async function(req,res)
{ 
    
 
    

    const data = parseInt(req.params.id)

    const Mydata = req.body

    // console.log(Mydata)

    const Myname = Mydata.myname

    const Myage = Mydata.myage

    const Mycity = Mydata.mycity

    // console.log(Myage , Mycity)
    
    const Studentdata = await StudentModel.find({rollno:data})

    // console.log(Studentdata)

    Studentdata.map(async function(i)
    {
        if(i.age != Myage)
        {
            await StudentModel.findOneAndUpdate({rollno : data} , {$set : {age : Myage}}  , {new:true})
        }

        if(i.city != Mycity)
        {
            await StudentModel.findOneAndUpdate({rollno : data} , {$set : {city : Mycity}}  , {new:true})
        }

        if(i.name != Myname)
        {
            await StudentModel.findOneAndUpdate({rollno : data} , {$set : {name : Myname}}  , {new:true})
        }

    })
    
    // await StudentModel.findOneAndUpdate({rollno : data} , {$set : Mydata}  , {new:true})

   
     

    res.send("Success")


   



     
})








App.listen(7001 , function()
{
    console.log("port is running at 7001")
})
