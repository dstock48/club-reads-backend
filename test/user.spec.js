const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server.js');
const configuration = require('../knexfile')[process.env.NODE_ENV];
const db = require('knex')(configuration);

const should = chai.should();

chai.use(chaiHttp);

describe('API book routes', () => {
  before((done) => {
    db.migrate.latest()
      .then(() => done())
      .catch(error => console.log(error));
  });

  beforeEach((done) => {
    db.seed.run()
      .then(() => done())
      .catch(error => console.log(error));
  });

  describe('POST /api/v1/user/login', () => {
    it('should be able to log in a user', (done) => {
      chai.request(server)
        .post('/api/v1/user/login')
        .send({
          id: 4,
          email: 'dave@email.com',
          action: 'login',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.user.should.have.property('email');
          res.body.user.email.should.equal('dave@email.com');
          res.body.user.should.have.property('id');
          res.body.user.id.should.equal(4);
          res.body.user.should.have.property('club_id');
          res.body.user.club_id.should.equal(2);
          res.body.user.should.have.property('updated_at');
          res.body.user.should.have.property('created_at');

          done();
        });
    });
    it('should throw an error if user logging in does not exist', (done) => {
      chai.request(server)
        .post('/api/v1/user/login')
        .send({
          id: 11,
          email: 'missThang@gmail.com',
          action: 'login',
        })
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.have.property('error');
          res.body.error.should.equal('User not found');

          done();
        })
    });
    it('should throw a 404 status error if endpoint is wrong', (done) => {
      chai.request(server)
        .post('/api/v1/logn')
        .send({
          id: 1,
          email: 'travis@email.com',
          action: 'login',
        })
        .end((err, res) => {
          res.status.should.equal(404);
          done();
        });
    });
  });

  describe('POST /api/v1/user/signup', () => {
    it.only('should add a new user trying to sign up', (done) => {
      chai.request(server)
        .post('/api/v1/user/signup')
        .send({
          id: 5,
          email: 'polly.pocket@gmail.com',
          club_id: 1,
          action: 'signup',
        })
        .end((err, res) => {
          console.log(res.error);
          res.should.have.status(201);

          done();
        });
    });
