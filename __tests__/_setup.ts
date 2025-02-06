import nock from 'nock';

jest.setTimeout(30000);

// Disable all network connections by default
nock.disableNetConnect();

const allowedHosts = [/localhost/];

nock.enableNetConnect((host: string) => {
  return allowedHosts.some((regexp) => regexp.test(host));
});
