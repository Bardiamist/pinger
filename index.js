const util = require('util')
const exec = util.promisify(require('child_process').exec);
const nodemailer = require('nodemailer');

/**
 * Config start
 */

const timeoutSeconds = 30;
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
    pass: 'fromEmailPassword'
  }
});

const getFailSubject = (host) => `${host} не пингуется`;
const getFailText = (host, seconds) => `${host} уже ${seconds} секунд не пингуется`;

const getSeccessSubject = (host) => `${host} снова пингуется`;
const successText = 'Алилуя';

/**
 * Config end
 */

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

      report(getSeccessSubject(host), successText);
    }
  } catch (exception) {
    const prevTime = timeByHost[host];
    const time = Date.now();

    if (prevTime != null) {
      const seconds = (time - prevTime) / 1000;

      if (seconds > timeoutSeconds) {
        if (!isTimeoutByHost[host]) {
          isTimeoutByHost[host] = true;

          report(getFailSubject(host), getFailText(host, seconds));
        }
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
