'use strict';

module.exports = function middleware(options, app) {
  const weAppEngineConfig = app.config.weAppEngine;
  const { projectEnv } = weAppEngineConfig;
  return async (ctx, next) => {
    app.weAppEngine = app.weAppEngine || {};
    const weAppEngine = app.weAppEngine;
    const config = weAppEngine.config || {};
    const grayInfo = weAppEngine.grayInfo;
    const appProjectList = config.appProjectList;
    weAppEngine.appInfo = {
      ...config.appInfoList,
    };
    const appInfo = weAppEngine.appInfo;
    if (projectEnv) {
      // 打开项目环境则开启项目环境匹配计算
      const { hostname } = ctx.request;
      for (const appName in appProjectList) {
        if (appProjectList[appName] && appProjectList[appName][hostname]) {
          appInfo[appName] = appProjectList[appName][hostname];
        }
      }
    }
    if (appInfo && grayInfo) {
      for (const appName in grayInfo) {
        if (grayInfo[appName]) {
          appInfo[appName] = grayInfo[appName];
        }
      }
    }
    await next();
  };
};
