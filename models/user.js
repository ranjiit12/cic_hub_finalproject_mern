var mongoose = require("mongoose");
const bcrypt   = require("bcrypt");
const jwt = require("jsonwebtoken");
const SALT_I = 10;

var userSchema = new mongoose.Schema({
       email: String,
       password :String,
       token : {
              type:String
       }
       

});

userSchema.pre("save", function(next)  {
       var user = this;
       if(user.isModified("password")){
       bcrypt.genSalt(SALT_I, function (err, salt)  {
          if(err) return next(err);
          bcrypt.hash(user.password, salt, function(err, hash) {
                 if(err)  return next(err);
                 user.password = hash;
                 next();
                 
          })
       });
       } else {
              next();
       }
});

userSchema.methods.comparePassword  =  function(candidatePassword, cb) {
         bcrypt.compare(candidatePassword, this.password, function(err, isMatch)  {
            if(err) cb(err);
             cb(null, isMatch);
        })
}
userSchema.methods.generateToken  = function(cb) {
       var user = this;
       var token = jwt.sign(user._id.toHexString(), "supersceret");
       user.token = token;
       user.save(function(err, savedUser){
              if(err) return cb(err);
              cb(null,savedUser);
              
       }); 
}
userSchema.statics.findByToken = function(token, cb) {
      var user = this;
      jwt.verify(token, "supersceret", function(err, decode) {
          user.findOne({"_id":decode, "token":token}, function(err, foundUser) {
              if(err) return cb(err);
              cb(null, foundUser);
          })
      })
}

module.exports = mongoose.model("User", userSchema);