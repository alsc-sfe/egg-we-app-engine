'use strict';

const { FNV } = require('fnv');
const grayCalculateHandle = require('./gray-calculate-handle');

module.exports = function grayCalculate(sign, grayRuleList) {
  const grayInfo = {};
  if (sign && grayRuleList) {
    const fnv = (new FNV());
    fnv.update(Buffer.from(sign));
    fnv.digest('hex');
    const value = fnv.value();
    let mod = value % 100;
    if (mod < 0) {
      mod = (100 + mod) % 100;
    }
    for (const appName in grayRuleList) {
      const grayRule = grayRuleList[appName];
      const { rules, grayVersion } = grayRule;
      for (const rule of rules) {
        const { type, value } = rule;
        const handle = grayCalculateHandle && typeof grayCalculateHandle[type] === 'function' ? grayCalculateHandle[type] : null;
        if (handle && grayCalculateHandle[type](value, sign, mod) && grayVersion) {
          grayInfo[appName] = grayVersion;
          break;
        }
      }
    }
  }
  return grayInfo;
};
