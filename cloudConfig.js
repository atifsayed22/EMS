const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'EMS/others';
    let resource_type = 'auto'; // Automatically handles all files
    let allowed_formats = ['jpg', 'jpeg', 'png'];

    if (file.fieldname === 'profileImage') {
      folder = 'EMS/profile_images';
      resource_type = 'image';
      allowed_formats = ['jpg', 'jpeg', 'png'];
    } 
    else if (file.fieldname === 'cvFile') {
      folder = 'EMS/cv_files';
      resource_type = 'raw'; // IMPORTANT
      allowed_formats = ['pdf', 'doc', 'docx', 'zip']; // Include zip if needed
    }
    else if(file.fieldname === 'logo'){
      folder='EMS/company_logo'
      resource_type = 'raw'
      allowed_formats = ['jpg', 'jpeg', 'png'];
    }

    return {
      folder,
      resource_type,
      allowed_formats,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  }
});

module.exports = {
  cloudinary,
  storage
};
