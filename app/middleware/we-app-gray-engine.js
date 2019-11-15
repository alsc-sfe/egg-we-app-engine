'use strict';

const grayCalculate = require('../../lib/gray-calculate');

module.exports = function middleware(options, app) {
  const weAppEngineConfig = app.config.weAppEngine;
  const { grayField } = weAppEngineConfig;
  return async (ctx, next) => {
    app.weAppEngine = app.weAppEngine || {};
    const weAppEngine = app.weAppEngine;
    const config = weAppEngine.config || {};
    const grayRuleList = config.grayRuleList || {};
    const sign = ctx[grayField] || '';
    const grayInfoListObject = grayCalculate(sign.toString(), grayRuleList);
    weAppEngine.grayInfo = grayInfoListObject;
    await next();
  };
};
