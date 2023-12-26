const {initializeApp}=require('firebase/app');
const {getStorage}=require('firebase/storage');
const  firebaseconfig={storageBucket:process.env.BUCKET_URI}

const app=initializeApp(firebaseconfig);
const storage=getStorage(app);
