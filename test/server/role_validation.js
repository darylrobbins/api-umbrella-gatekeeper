'use strict';

require('../test_helper');

var Factory = require('factory-lady');

describe('ApiUmbrellaGatekeper', function() {
  shared.runServer({
    apis: [
      {
        frontend_host: 'localhost',
        backend_host: 'example.com',
        url_matches: [
          {
            frontend_prefix: '/info/',
            backend_prefix: '/info/',
          }
        ],
        settings: {
          required_roles: ['restricted', 'private'],
        },
        sub_settings: [
          {
            http_method: 'any',
            regex: '^/info/sub',
            settings: {
              required_roles: ['sub'],
            },
          },
        ],
      },
      {
        frontend_host: 'localhost',
        backend_host: 'example.com',
        url_matches: [
          {
            frontend_prefix: '/',
            backend_prefix: '/',
          }
        ],
      },
    ],
  });

  describe('role validation', function() {
    describe('unauthorized api_key with null roles', function() {
      beforeEach(function setupApiUser(done) {
        Factory.create('api_user', { roles: null }, function(user) {
          this.apiKey = user.api_key;
          done();
        }.bind(this));
      });

      shared.itBehavesLikeGatekeeperBlocked('/info/', 403, 'API_KEY_UNAUTHORIZED');
    });

    describe('unauthorized api_key with empty roles', function() {
      beforeEach(function setupApiUser(done) {
        Factory.create('api_user', { roles: null }, function(user) {
          this.apiKey = user.api_key;
          done();
        }.bind(this));
      });

      shared.itBehavesLikeGatekeeperBlocked('/info/', 403, 'API_KEY_UNAUTHORIZED');
    });

    describe('unauthorized api_key with other roles', function() {
      beforeEach(function setupApiUser(done) {
        Factory.create('api_user', { roles: ['something', 'else'] }, function(user) {
          this.apiKey = user.api_key;
          done();
        }.bind(this));
      });

      shared.itBehavesLikeGatekeeperBlocked('/info/', 403, 'API_KEY_UNAUTHORIZED');
    });

    describe('authorized api_key with one of the appropriate role', function() {
      beforeEach(function setupApiUser(done) {
        Factory.create('api_user', { roles: ['private'] }, function(user) {
          this.apiKey = user.api_key;
          done();
        }.bind(this));
      });

      shared.itBehavesLikeGatekeeperAllowed('/info/');
    });

    describe('api_key with admin roles is authorized automatically', function() {
      beforeEach(function setupApiUser(done) {
        Factory.create('api_user', { roles: ['admin'] }, function(user) {
          this.apiKey = user.api_key;
          done();
        }.bind(this));
      });

      shared.itBehavesLikeGatekeeperAllowed('/info/');
    });

    describe('sub-url with different role requirements', function() {
      describe('unauthorized api_key with other roles', function() {
        beforeEach(function setupApiUser(done) {
          Factory.create('api_user', { roles: ['restricted'] }, function(user) {
            this.apiKey = user.api_key;
            done();
          }.bind(this));
        });

        shared.itBehavesLikeGatekeeperBlocked('/info/sub', 403, 'API_KEY_UNAUTHORIZED');
      });

      describe('authorized api_key with the appropriate role', function() {
        beforeEach(function setupApiUser(done) {
          Factory.create('api_user', { roles: ['sub'] }, function(user) {
            this.apiKey = user.api_key;
            done();
          }.bind(this));
        });

        shared.itBehavesLikeGatekeeperAllowed('/info/sub');
      });
    });

    describe('non-matching path', function() {
      beforeEach(function setupApiUser(done) {
        Factory.create('api_user', { roles: null }, function(user) {
          this.apiKey = user.api_key;
          done();
        }.bind(this));
      });

      shared.itBehavesLikeGatekeeperAllowed('/not/restricted');
    });
  });
});
