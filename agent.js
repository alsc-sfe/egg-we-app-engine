'use strict';

const grayConfig = require('./lib/gray-config');
const LocalStorage = require('local-storage-es6');


/**
 * 灰度规则列表
 */
const grayRuleList = {};
/**
 * 灰度规则中取出的当前版本信息
 */
const appInfoList = {};
/**
 * 应用项目环境对象
 */
const appProjectList = {};
/**
 * 兜底的应用版本信息
 */
const backupAppInfoList = {};

const subscribeRuleList = {};
const subscribeInfoList = {};
const subscribeProjectList = {};

module.exports = function(agent) {
  // agent.name --> 当前Node应用名
  const name = agent.name;
  const weAppEngineConfig = agent.config.weAppEngine;
  const { cacheDir, delimiter, group, projectEnv } = weAppEngineConfig;

  const localStorage = new LocalStorage({
    path: cacheDir,
    encryptFileName: false,
    encryptFileContent: false,
    mkdir: true,
    secretKey: '',
  });

  const buildGrayRuleDataId = (appName) => {
    // acm的dataId不支持/，这里将/改为__
    return `app-gray${delimiter}${name}${delimiter}${appName.replace('/', '__')}`;
  };

  const buildAppProjectDataId = appName => {
    // acm的dataId不支持/，这里将/改为__
    return `app-project${delimiter}${name}${delimiter}${appName.replace('/', '__')}`;
  };

  const buildAppInfoDataId = appName => {
    // acm的dataId不支持/，这里将/改为__
    return `app-info${delimiter}${name}${delimiter}${appName.replace('/', '__')}`;
  };

  let setAppInfoListTimeoutId = null;
  const sendAppInfo = () => {
    // 3s内消息合并，减少通信次数
    setAppInfoListTimeoutId && clearTimeout(setAppInfoListTimeoutId);
    setAppInfoListTimeoutId = setTimeout(() => {
      // 先合并当前信息和兜底信息，再将应用信息发送给work进程
      agent.messenger.sendToApp('setAppInfoList', Object.assign({}, backupAppInfoList, appInfoList));
    }, 3000);
  };

  const subscribeRuleUpdate = appName => {
    if (!subscribeRuleList[appName]) {
      const dataId = buildGrayRuleDataId(appName);
      subscribeRuleList[appName] = dataId;
      agent.acm.subscribe({
        dataId,
        group,
      }, ruleString => {
        try {
          agent.logger.info(`开始解析灰度规则[${appName}] -> ${dataId}`);
          const ruleAcm = ruleString ? JSON.parse(ruleString) : null;
          // 有灰度规则，并且灰度版本跟正式版本不相同时，灰度规则才有效
          if (ruleAcm && ruleAcm.rules && ruleAcm.rules.length && ruleAcm.version !== ruleAcm.grayVersion) {
            grayRuleList[appName] = grayConfig.preprocess(ruleAcm);
          } else if (grayRuleList[appName]) {
            // 不启用的灰度规则，则删掉对应的键值，在用户访问时减少遍历提升性能
            delete grayRuleList[appName];
          }
          if (ruleAcm && ruleAcm.version) {
            appInfoList[appName] = ruleAcm.version;
          } else if (appInfoList[appName]) {
            // 如果当前推送的版本号里面没有版本信息，那么去掉appInfoList内的版本；
            // 只有配置推送出错，或者应用删掉了才会进到这里；
            delete appInfoList[appName];
          }
          // 发送应用信息给worker
          sendAppInfo();
          // 将应用信息发送给work进程
          agent.messenger.sendToApp('setGrayRuleList', grayRuleList);
          localStorage.write('grayRuleList', grayRuleList, () => {
            agent.logger.info(`缓存灰度规则成功[${appName}] -> ${dataId}`);
          });
        } catch (e) {
          agent.logger.error(`解析灰度规则失败[${appName}] -> ${e.message}`);
        }
      });
    }
  };

  const subscribeAppProjectUpdate = appName => {
    if (!subscribeProjectList[appName]) {
      const dataId = buildAppProjectDataId(appName);
      subscribeProjectList[appName] = dataId;
      agent.acm.subscribe({
        dataId,
        group,
      }, projectInfoString => {
        try {
          agent.logger.info(`开始解析项目环境[${appName}] -> ${dataId}`);
          const projectInfo = JSON.parse(projectInfoString);
          if (projectInfo) {
            appProjectList[appName] = projectInfo;
          } else if (appProjectList[appName]) {
            delete appProjectList[appName];
          }
          // 将应用信息发送给work进程
          agent.messenger.sendToApp('setAppProjectList', appProjectList);
          localStorage.write('appProjectList', appInfoList, () => {
            agent.logger.info(`缓存项目环境成功[${appName}] -> ${dataId}`);
          });
        } catch (e) {
          agent.logger.error(`解析项目环境失败[${appName}] -> ${e.message}`);
        }
      });
    }
  };

  const subscribeAppInfoUpdate = appName => {
    if (!subscribeInfoList[appName]) {
      const dataId = buildAppInfoDataId(appName);
      subscribeInfoList[appName] = dataId;
      agent.acm.subscribe({
        dataId,
        group,
      }, infoString => {
        try {
          agent.logger.info(`开始解析应用信息[${appName}] -> ${dataId}`);
          const backupAppInfo = JSON.parse(infoString);
          if (backupAppInfo && backupAppInfo.version) {
            backupAppInfoList[appName] = backupAppInfo.version;
          } else if (backupAppInfoList[appName]) {
            delete backupAppInfoList[appName];
          }
          // 发送应用信息给worker
          sendAppInfo();
          localStorage.write('appInfoList', appInfoList, () => {
            agent.logger.info(`缓存应用信息成功[${appName}] -> ${dataId}`);
          });
        } catch (e) {
          agent.logger.error(`解析应用信息失败[${appName}] -> ${e.message}`);
        }
      });
    }
  };

  // ready后执行，防止过早的agent.messenger.sendToApp会无法通信
  agent.messenger.on('egg-ready', () => {
    // 订阅应用列表的Acm数据，初始化、新增应用、删除应用的情况都触发这种方式重新拉取灰度规则
    agent.acm.subscribe({
      dataId: `app-list${delimiter}${name}`,
      group,
    }, appListString => {
      try {
        agent.logger.info('开始解析微应用列表');
        const appList = JSON.parse(appListString);
        for (const appName of appList) {
          // 订阅灰度规则变更
          subscribeRuleUpdate(appName);
          // 订阅应用信息变更
          subscribeAppInfoUpdate(appName);
          if (projectEnv) {
            subscribeAppProjectUpdate(appName);
          }
        }
        agent.logger.info('解析微应用列表成功');
      } catch (e) {
        agent.logger.error(`解析应用列表失败 -> ${e.message}`);
      }
    });
  });
};
