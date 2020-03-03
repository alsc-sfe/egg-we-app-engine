'use strict';

const LocalStorage = require('local-storage-es6');

module.exports = app => {
  const weAppEngineConfig = app.config.weAppEngine;
  const { cacheDir, projectEnv } = weAppEngineConfig;

  // 打开灰度引擎的middleware
  app.config.coreMiddleware.push('weAppGrayEngine');
  // 打开版本控制引擎的middleware
  app.config.coreMiddleware.push('weAppEngine');

  const localStorage = new LocalStorage({
    path: cacheDir,
    encryptFileName: false,
    encryptFileContent: false,
    mkdir: false,
    secretKey: '',
  });

  app.weAppEngine = {};
  const weAppEngine = app.weAppEngine;
  weAppEngine.config = weAppEngine.config || {};
  const config = weAppEngine.config;
  config.grayRuleList = config.grayRuleList || {};
  config.appInfoList = config.appInfoList || {};
  config.appProjectList = config.appProjectList || {};

  try {
    config.grayRuleList = localStorage.readSync('grayRuleList');
  } catch (e) {
    app.logger.info(`读取微应用灰度缓存失败 -> ${e.message}`);
  }
  // 订阅进程消息，设置灰度规则配置
  app.messenger.on('setGrayRuleList', grayRuleList => {
    config.grayRuleList = grayRuleList;
  });

  // 是否开启项目环境
  if (projectEnv) {
    try {
      config.appProjectList = localStorage.readSync('appProjectList');
    } catch (e) {
      app.logger.info(`读取微应用项目缓存失败 -> ${e.message}`);
    }
    // 订阅进程消息，设置项目环境配置
    app.messenger.on('setAppProjectList', appProjectList => {
      config.appProjectList = appProjectList;
    });
  }

  try {
    config.appInfoList = localStorage.readSync('appInfoList');
  } catch (e) {
    app.logger.info(`读取微应用版本缓存失败 -> ${e.message}`);
  }
  // 订阅进程消息，设置应用列表配置
  app.messenger.on('setAppInfoList', appInfoList => {
    config.appInfoList = appInfoList;
  });
};
