const util = require('util')
const exec = util.promisify(require('child_process').exec);

const timeoutSeconds = 60;
const delaySeconds = 10;

const hosts = [
  'google.com',
  '192.168.10.20',
];

const isTimeoutByHost = {};
const timeByHost = {};

const ping = async (host) => {
  try {
    await exec(`ping ${host}`);

    timeByHost[host] = Date.now();

    if (isTimeoutByHost[host] != null) {
      delete isTimeoutByHost[host];

      console.log('Снова пингуется');
    }
  } catch (exception) {
    const prevTime = timeByHost[host];
    const time = Date.now();

    if (prevTime != null) {
      if (time - prevTime > timeoutSeconds * 1000) {
        isTimeoutByHost[host] = true;

        console.log('Не пингуется');
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
