require('dotenv').config();
const cloudinary = require('./config/cloudinary');

async function testSignedUrl() {
    const publicId = "placement_resumes/x3vlyifg6x6rpetsksak.pdf"; // From previous raw upload test

    const signedUrl = cloudinary.url(publicId, {
        resource_type: "raw",
        sign_url: true,
        // we might not need to specify format because public_id has .pdf
    });

    console.log("Signed URL:", signedUrl);

    // Let's test if it works!
    try {
        const fetch = (await import('node-fetch')).default || global.fetch;
        const res = await fetch(signedUrl);
        console.log("Status:", res.status);
        console.log("Type:", res.headers.get('content-type'));
    } catch (e) {
        console.log(e);
    }
}
testSignedUrl();
