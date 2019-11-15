'use strict';

const configPreprocess = require('./gary-config-preprocess');

const preprocess = ruleAcm => {
  const { rules = [], grayVersion, appName } = ruleAcm;
  const length = rules.length;
  for (let i = 0; i < length; i++) {
    const rule = rules[i];
    // 灰度配置预处理
    const processHandle = configPreprocess && typeof configPreprocess[rule.type] === 'function' ? configPreprocess[rule.type] : null;
    if (processHandle) {
      rules[i] = processHandle(rule);
    }
  }
  const grayRule = {
    appName,
    rules,
    grayVersion,
  };
  return grayRule;
};

module.exports = {
  preprocess,
};
