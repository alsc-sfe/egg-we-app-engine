'use strict';

const path = require('path');

module.exports = appInfo => {

  const weAppEngine = {
    cacheDir: path.join(appInfo.root, 'cache'),
    group: 'alsc-saas-publish-service',
    delimiter: ':',
    projectEnv: false,
    grayField: 'userId',
  };

  const acm = {
    endpoint: 'acm.aliyun.com', // Available in the ACM console
    namespace: '**********', // Available in the ACM console
    accessKey: '**********', // Available in the ACM console
    secretKey: '**********', // Available in the ACM console
    requestTimeout: 6000, // Request timeout, 6s by default
  };

  return {
    weAppEngine,
    acm,
  };
};
