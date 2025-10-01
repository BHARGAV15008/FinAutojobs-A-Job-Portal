import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendJobMatchEmail = async (email, jobTitle, company) => {
  await transporter.sendMail({
    to: email,
    subject: `New Job Match: ${jobTitle}`,
    html: `<h2>New Job Opportunity!</h2><p>${jobTitle} at ${company}</p>`
  });
};

export const sendInterviewUpdate = async (email, status, jobTitle) => {
  await transporter.sendMail({
    to: email,
    subject: `Interview Update: ${jobTitle}`,
    html: `<h2>Interview Status: ${status}</h2><p>For position: ${jobTitle}</p>`
  });
};
