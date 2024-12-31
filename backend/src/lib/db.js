const mongoose  =require('mongoose');

module.exports.connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB Connected : ${conn.connection.host}`);

    } catch (error) {
        console.log("MongoDB conection error:", error);
    }

};