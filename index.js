const util = require('util')
const exec = util.promisify(require('child_process').exec);
const nodemailer = require('nodemailer');

const timeoutSeconds = 60;
const delaySeconds = 10;

const fromEmail = 'fromEmail@gmail.com';
const toEmail = 'toEmail@gmail.com';

const hosts = [
  'google.com',
  '192.168.10.20',
];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: fromEmail,
    pass: 'yourpassword'
  }
});

const isTimeoutByHost = {};
const timeByHost = {};

const report = (subject, text) => {
  transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject,
    text,
  }, (exception) => {
    if (exception != null) {
      console.error(exception);
    }
  });
};

const ping = async (host) => {
  try {
    await exec(`ping ${host}`);

    timeByHost[host] = Date.now();

    if (isTimeoutByHost[host] != null) {
      delete isTimeoutByHost[host];

      report(`${host} снова пингуется`, 'Алилуя');
    }
  } catch (exception) {
    const prevTime = timeByHost[host];
    const time = Date.now();

    if (prevTime != null) {
      const seconds = time - prevTime / 1000;

      if (seconds > timeoutSeconds) {
        isTimeoutByHost[host] = true;

        report(`${host} не пингуется`, `${host} уже ${seconds} секунд не пингуется`);
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
