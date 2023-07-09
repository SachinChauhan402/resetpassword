const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text, link) => {
    
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: "Gmail",
            port: 587,
            secure: true,
            auth: {
                user: 'chauhansachin2k24@gmail.com',
                pass: "jjglkejetkowxind",
            },
        });
       

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: `${text} Click the following link to reset your password: ${link}`,
        });
        

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;