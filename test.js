/**
 * Change our DB to 'test' for testing
 * @type {String}
 */
process.env.DB_NAME = 'test'

var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var JWT;
var tx;
describe('loading express', function() {
  var server;
  beforeEach(function() {
    server = require('./index');
  });
  afterEach(function() {
    server.close();
  });

  it('responds to / with a 404 error', function testSlash(done) {
    request(server)
      .get('/')
      .expect(404, done);
  });

  it('attempts to signup a new user without params should fail with errors', function testSlash(done) {
    request(server)
      .post('/private/v1/auth/signup')
      .end(function(err, res) {
        expect(res.body.success).to.be.equal(false);
        expect(res.body.errors).to.be.an('array').that.is.not.empty;
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`attempts to signup a new user with passwords that don't contain
  at least 1 number, 1 lowercase char & 1 uppercase char should fail`, function testSlash(done) {
    request(server)
      .post('/private/v1/auth/signup')
      .send({
        email:'i@owale.co',
        password:'simpl3',
        confirmPassword:'simple3'
      })
      .end(function(err, res) {
        expect(res.body.success).to.be.equal(false);
        expect(res.body.errors).to.be.an('array').that.is.not.empty;
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`attempts to signup a new user with a valid email and Passwords
    that don't match should be unsuccessful`, function testSlash(done) {
    request(server)
      .post('/private/v1/auth/signup')
      .send({
        email:'i@owale.co',
        password:'SimplePass1',
        confirmPassword:'SimplePass2'
      })
      .end(function(err, res) {
        expect(res.body.success).to.be.equal(false);
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`attempts to signup a new user with a valid email and password
    should be successful with a JWT token response`, function testSlash(done) {
    request(server)
      .post('/private/v1/auth/signup')
      .send({
        email:'i@owale.co',
        password:'SimplePass1',
        confirmPassword:'SimplePass1'
      })
      .end(function(err, res) {
        expect(res.body).to.have.property('token');
        expect(res.body.token).to.be.a('string');
        JWT = res.body.token;
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`attempts to login a user with invalid credentials should
    be unsuccessful and return an error response`, function testSlash(done) {
    request(server)
      .post('/private/v1/auth/login')
      .send({
        email:'i@owale.co',
        password:'wrongpassword'
      })
      .end(function(err, res) {
        expect(res.status).to.be.equal(401);
        expect(res.body).to.have.property('case');
        expect(res.body.case).to.be.equal('Invalid-Credentials');
        expect(res.body).to.have.property('messages');
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`attempts to login a user with valid credentials should
    be successful`, function testSlash(done) {
    request(server)
      .post('/private/v1/auth/login')
      .send({
        email:'i@owale.co',
        password:'SimplePass1',
        confirmPassword:'SimplePass1'
      })
      .end(function(err, res) {
        JWT = res.body.token;
        expect(res.status).to.be.equal(200);
        expect(res.body).to.have.property('token');
        expect(res.body.token).to.be.a('string');
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`the private/v1/auth/user endpoint should return the currently
    authenticated user`, function testSlash(done) {
    request(server)
      .post('/private/v1/auth/user')
      .set('Authorization', `Bearer ${JWT}`)
      .end(function(err, res) {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.have.property('_id');
        expect(res.body).to.have.property('email');
        expect(res.body.email).to.be.equal('i@owale.co');
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`POSTing the private/v1/auth/transactions endpoint should create a
    new transaction successfully and return it as JSON`, function testSlash(done) {
    request(server)
      .post('/private/v1/transactions')
      .set('Authorization', `Bearer ${JWT}`)
      .send({
        hash:'3913ca9e5k29ee39458ac800ed83b32ed275405cc8ad9c8977aa68f7ef67454a',
        tags:'testTransaction',
      })
      .end(function(err, res) {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.have.property('tags');
        expect(res.body).to.have.property('hash');
        expect(res.body).to.have.property('date');
        expect(res.body).to.have.property('ownerId');
        expect(res.body).to.have.property('_id');
        expect(res.body.hash).to.be.equal('3913ca9e5k29ee39458ac800ed83b32ed275405cc8ad9c8977aa68f7ef67454a');
        expect(res.body.tags).to.have.lengthOf(1);
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`POSTing the private/v1/auth/transactions endpoint with the same transaction hash
    in an attempt to create dupes should return an error`, function testSlash(done) {
    request(server)
      .post('/private/v1/transactions')
      .set('Authorization', `Bearer ${JWT}`)
      .send({
        hash:'3913ca9e5k29ee39458ac800ed83b32ed275405cc8ad9c8977aa68f7ef67454a',
        tags:'testTransaction',
      })
      .end(function(err, res) {
        expect(res.status).to.be.equal(400);
        expect(res.body).to.have.property('success');
        expect(res.body.success).to.be.equal(false);
        expect(res.body).to.have.property('errors');
        expect(res.body.errors).to.have.lengthOf(1);
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`GETing the private/v1/auth/transactions should return the user's transactions as JSON`, function testSlash(done) {
    request(server)
      .get('/private/v1/transactions')
      .set('Authorization', `Bearer ${JWT}`)
      .end(function(err, res) {
        tx = res.body[0];
        expect(res.status).to.be.equal(200);
        expect(res.body).to.have.lengthOf(1);
        expect(res.body[0]).to.have.property('date');
        expect(res.body[0]).to.have.property('hash');
        expect(res.body[0]).to.have.property('ownerId');
        expect(res.body[0]).to.have.property('tags');
        expect(res.body[0]).to.have.property('_id');
        expect(res.body[0].hash).to.be.equal('3913ca9e5k29ee39458ac800ed83b32ed275405cc8ad9c8977aa68f7ef67454a');
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it(`DELETE-ing the private/v1/auth/transactions should return the user's transactions as JSON`, function testSlash(done) {
    request(server)
      .delete('/private/v1/transactions')
      .set('Authorization', `Bearer ${JWT}`)
      .send({
        id:tx._id
      })
      .end(function(err, res) {
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.empty;
        console.log(res.body);
        if (err) {
          return done(err);
        }
        done();
      });
  });

});
