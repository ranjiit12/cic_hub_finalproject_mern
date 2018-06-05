const express = require("express"),
      bodyParser = require("body-parser"),
      bcrypt    = require("bcrypt"),
      cookieParser = require("cookie-parser"),
      mongoose = require("mongoose"),      
      path     = require("path"),
      app     = express();

const {auth} = require("./middle_wares/auth");

app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost/cic_hub");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const User = require("./models/user.js");

app.get("/register", (req, res) => {
     res.render("register") 
});

app.get("/login", (req, res) => {
    res.render("login");
})
app.post("/api/user/login", (req, res) => {
    User.findOne({email:req.body.email}, (err, foundUser)=> {
        if(!foundUser) return res.send({"message": "no user found"});
        foundUser.comparePassword(req.body.password, (err, isMatch) => {
            if(err) throw err;
            if(! isMatch) res.status(400).send("wrong password");
            foundUser.generateToken((err, userWithToken)=> {
                if(err) return res.status(400).send(err);
                res.cookie("auth", userWithToken.token).send("ok");
            })
        })
      
    });
    
});
app.post("/api/user", (req, res)=> {
    const user = new User({
        email: req.body.email,
        password:req.body.password
    });

    
    user.save((err, createdUser) => {
        if(err) {
            console.log(err);
          return res.status(400).send(err);
            
        }
        res.status(200).send(createdUser)
    })
    
});


app.get("/api/user/profile", auth,(req, res) => {
     res.status(200).send(req.token);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> {
   console.log("magic is happening at ", PORT); 
});

module.exports = {auth}