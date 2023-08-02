const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');


// Configuracion de APIS Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});


// Config del Storage Engine (motor del almacenamiento de img)
// Crea una instancia de CloudinaryStorage y define parametros de almacenamiento de img (ubicacion y formatos) 
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Consejeros',
        allowed_formats: ['jpeg', 'jpg', 'png']
    }
});


// define cual sera el motor de almacenamiento de img (storage)
const upload = multer({ storage: storage });

module.exports = {
    cloudinary,
    upload
}