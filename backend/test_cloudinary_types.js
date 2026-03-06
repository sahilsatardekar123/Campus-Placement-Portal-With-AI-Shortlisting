require('dotenv').config();
const cloudinary = require('./config/cloudinary');
const streamifier = require('streamifier');
const fs = require('fs');

async function testCloudinaryUploadImage() {
    try {
        const minPdf = Buffer.from(
            "%PDF-1.4\n" +
            "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
            "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
            "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >> endobj\n" +
            "4 0 obj << /Length 61 >> stream\n" +
            "BT /F1 12 Tf 100 700 Td (Resume: skills are React, Node.js, Python) Tj ET\n" +
            "endstream endobj\n" +
            "xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000288 00000 n \ntrailer << /Size 5 /Root 1 0 R >>\nstartxref\n398\n%%EOF"
        );

        const uploadToCloudinary = (type) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'placement_resumes',
                        resource_type: type
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );
                streamifier.createReadStream(minPdf).pipe(stream);
            });
        };

        const resAuto = await uploadToCloudinary('auto');
        console.log("Auto Type ->", resAuto.secure_url);

        const resImage = await uploadToCloudinary('image');
        console.log("Image Type ->", resImage.secure_url);

    } catch (e) {
        console.error("Upload failed:", e);
    }
} testCloudinaryUploadImage();
