const multer=require('multer');
const {v4:uuidv4} = require('uuid');
const path=require('path');

const upload=multer({storage:multer.memoryStorage()})

module.exports=upload;