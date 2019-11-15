'use strict';

const mock = require('egg-mock');

describe('test/we-app-engine.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/we-app-engine-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, weAppEngine')
      .expect(200);
  });
});
