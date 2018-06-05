const User = "../models/user";


let auth = (req, res, next) => {
    console.log(User);
    let token = req.cookies.auth;
      
    User.findByToken(token, (err, foundUser) => {
       if(err) return res.status(200).send("nothing");
       if(!foundUser) return res.status(401).send("not authorized");
       req.token = token;
       next();
    });
    
}

module.exports = {auth}