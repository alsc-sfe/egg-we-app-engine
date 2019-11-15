'use strict';

module.exports = acmRule => {
  const rule = { type: acmRule.type, value: {} };
  if (acmRule.value && acmRule.value.constructor === Array) {
    for (const sign of acmRule.value) {
      rule.value[sign] = true;
    }
  }
  return rule;
};
