const nodemailer = require('nodemailer');

// variable que envia correo electronico
const enviarCorreo = async (destinatario, asunto, contenido) => {

    // configura transporte SMTP para gmail vía conexión segura SSL/TLS
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // host de gmail
        port: process.env.EMAIL_PORT,
        secure: true, // utiliza conexión segura con SSL/TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {

        // envio de correo utilizando transporte creado previamente
        const info = await transporter.sendMail({
            from: '<no-reply> no-reply@noreply.info',
            to: destinatario,
            subject: asunto,
            html: contenido
        });

        console.log('Correo enviado exitosamente: ', info);

    } catch (error) {
        console.log('Error al enviar correo: ', error);
    }
}




module.exports = { enviarCorreo }