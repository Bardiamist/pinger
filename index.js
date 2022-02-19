const util = require('util')
const exec = util.promisify(require('child_process').exec);
const nodemailer = require('nodemailer');

/**
 * Config start
 */

const timeoutSeconds = 10;
const delaySeconds = 10;

const fromEmail = 'from@mail.ru';
const toEmail = 'to@gmail.com';

const hosts = [
  'google.com',
  '192.168.10.20',
];

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: fromEmail.split('@')[0],
    pass: "password"
  }
});

const getFailSubject = (host) => `${host} не пингуется`;
const getFailText = (host, seconds) => `${host} уже ${seconds} секунд не пингуется`;

const getSeccessSubject = (host) => `${host} снова пингуется`;
const successText = 'Алилуя';

/**
 * Config end
 */

const isEmailSentByHost = {};
const timeByHost = {};

const report = (subject, text, callback) => {
  transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject,
    text,
  }, (exception) => {
    if (exception != null) {
      console.error(exception);
    } else if (callback != null) {
      callback();
    }
  });
};

const ping = async (host) => {
  try {
    await exec(`ping ${host}`);

    timeByHost[host] = Date.now();

    if (isEmailSentByHost[host] != null) {
      delete isEmailSentByHost[host];

      report(getSeccessSubject(host), successText);
    }
  } catch (exception) {
    const prevTime = timeByHost[host];
    const time = Date.now();

    if (prevTime != null) {
      const seconds = (time - prevTime) / 1000;

      if (seconds > timeoutSeconds && !isEmailSentByHost[host]) {
        report(getFailSubject(host), getFailText(host, seconds), () => {
          isEmailSentByHost[host] = true;
        });
      }
    } else {
      timeByHost[host] = time;
    }
  }

  setTimeout(() => {
    ping(host);
  }, delaySeconds * 1000);
}

hosts.forEach(ping);
