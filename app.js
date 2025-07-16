require('dotenv').config()

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const methodOveride = require('method-override')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const multer = require('multer')
const ejsMate = require('ejs-mate')
const Admin = require('./models/admin.js')
const Company = require('./models/company.js')
const Employee = require('./models/employee.js')
const passport =require('passport')
const localStrategy = require('passport-local')
const {ValidateInput}=require('./validateInput.js')
const {ValidateResult}=require('express-validator')
const {registerAdmin}=require('./controllers/adminController.js')
const adminRoutes = require('./routes/adminRoutes.js')
const dashboardRoutes = require('./routes/dashboardRoutes.js')
const companyRoutes = require('./routes/companyRoutes.js')
const projectRoutes = require('./routes/projectRoutes.js')
const flash = require('connect-flash')
const MongoUrl= process.env.MONGO_URL
console.log(MongoUrl)
const { sample } = require('./cloudConfig.js');
const uploads = multer({ sample });


app.engine('ejs',ejsMate)



app.set("views",path.join(__dirname,"views"))
app.use(express.urlencoded({extended:true}))
app.use(methodOveride('_method'))
app.use(express.static(path.join(__dirname, "public")));

const port =8000
// setting up sessions
const store = MongoStore.create({
    mongoUrl:MongoUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
})


const sessionOptions ={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000
    }
}

  
app.use(session(sessionOptions))
app.use(flash())


// setting up  passport 
app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(Admin.authenticate()))

passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.admin=req.user
    res.locals.currentPath = req.path;


    next()
})

app.use(async (req, res, next) => {
  if (req.user) {
    try {
      const company = await Company.findOne({ owner: req.user._id });
      res.locals.companyData = company;
    } catch (err) {
      console.error("Error fetching company:", err);
      res.locals.companyData = null;
    }
  } else {
    res.locals.companyData = null;
  }
  next();
});

app.listen(port,(req,res)=>{
    console.log("listening to the port ")
})
main().then(()=>{
    console.log("DB Connected Successfully!")

})
.catch((err)=>{
    console.log(err)
})
async function main() {
    await mongoose.connect(MongoUrl)    
}


// routes for signup using router 
app.use('/',adminRoutes)
app.use('/dashboard',dashboardRoutes)
app.use('/company',companyRoutes)
app.use('/projects',projectRoutes)
app.get('/',(req,res)=>{
  res.redirect('/login')
})
app.post('/sample',uploads.fields([{name:'file'}]),async(req,res)=>{
  res.send("file uploaded to the cloud")
})

async function seedEmployees() {
    try {
      const companyId = '685d41a97a89ad5602a15747';
  
      const existing = await Employee.findOne({ email: 'john.doe@example.com' });
      if (existing) {
        console.log("⚠️ Dummy employees already exist. Skipping seeding.");
        return;
      }
  
      const dummyEmployees = [
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          mobile: '9876543210',
          department: 'Engineering',
          role: 'Frontend Developer',
          dateOfJoining: new Date('2022-01-15'),
          salary: 60000,
          salaryPaid: true,
          isPromoted: false,
          profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
          cvFile: '',
          company: companyId
        },
        {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          mobile: '9123456780',
          department: 'Design',
          role: 'UI/UX Designer',
          dateOfJoining: new Date('2023-03-10'),
          salary: 55000,
          profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
          cvFile: '',
          company: companyId
        },
        {
          firstName: 'Ali',
          lastName: 'Khan',
          email: 'ali.khan@example.com',
          mobile: '9988776655',
          department: 'HR',
          role: 'HR Executive',
          dateOfJoining: new Date('2024-01-01'),
          salary: 45000,
          isPromoted: true,
          profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
          cvFile: '',
          company: companyId
        }
      ];
  
      await Employee.insertMany(dummyEmployees);
      console.log("✅ Dummy employees inserted successfully.");
    } catch (err) {
      console.error("❌ Error inserting employees:", err.message);
    }
  }
// Error handling middleware
app.use((err,req,res,next)=>{
  let {status=500,message="some error occrured"}=err
  console.log("error middlewere-1 activated")
  res.status(status).send(message)
  res.redirect('/login')
})