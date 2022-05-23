import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import { Need } from 'src/needs/entities/need.entity';
import { NeedQuestion } from 'src/needs/entities/need-question.entity';
import { MeasureNeed } from 'src/needs/entities/measure-need.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

const freeUser = {
  email: 'test@test.com',
  username: 'tester',
  password: '123456',
};

const adminUser = {
  email: 'admin@test.com',
  username: 'admin',
  password: '123456',
};

describe('e2e', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>;
  let verificationsRepository: Repository<Verification>;
  let needsRepository: Repository<Need>;
  let needQuestionsRepository: Repository<NeedQuestion>;
  let measureNeedsRepository: Repository<MeasureNeed>;
  let freeJwtToken: string;
  let adminJwtToken: string;

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateFreeTest = (query: string) =>
    baseTest().set('X-JWT', freeJwtToken).send({ query });
  const privateAdminTest = (query: string) =>
    baseTest().set('X-JWT', adminJwtToken).send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    verificationsRepository = module.get<Repository<Verification>>(
      getRepositoryToken(Verification),
    );
    needsRepository = module.get<Repository<Need>>(getRepositoryToken(Need));
    needQuestionsRepository = module.get<Repository<NeedQuestion>>(
      getRepositoryToken(NeedQuestion),
    );
    measureNeedsRepository = module.get<Repository<MeasureNeed>>(
      getRepositoryToken(MeasureNeed),
    );
    await app.init();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  describe('UserModule', () => {
    describe('createAccount', () => {
      it('should create account', () => {
        return publicTest(`
        mutation {
          createAccount(input: {
            email:"${freeUser.email}",
            password:"${freeUser.password}",
            username:"${freeUser.username}",
            role:Free
          }) {
            ok
            error
          }
        }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  createAccount: { ok, error },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
          });
      });

      it('should create admin account', () => {
        return publicTest(`
        mutation {
          createAccount(input: {
            email:"${adminUser.email}",
            password:"${adminUser.password}",
            username:"${adminUser.username}",
            role:Admin
          }) {
            ok
            error
          }
        }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  createAccount: { ok, error },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
          });
      });

      it('should fail if account already exists', () => {
        return publicTest(`
          mutation {
            createAccount(input: {
              email:"${freeUser.email}",
              password:"${freeUser.password}",
              username:"${freeUser.username}",
              role:Free
            }) {
              ok
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  createAccount: { ok, error },
                },
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe('There is a user with that email already');
          });
      });
    });

    describe('login', () => {
      it('should login with correct credentials', () => {
        return publicTest(`
          mutation {
            login(input:{
              email:"${freeUser.email}",
              password:"${freeUser.password}",
            }) {
              ok
              error
              token
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { login },
              },
            } = res;
            expect(login.ok).toBe(true);
            expect(login.error).toBe(null);
            expect(login.token).toEqual(expect.any(String));
            freeJwtToken = login.token;
          });
      });

      it('should login admin with correct credentials', () => {
        return publicTest(`
          mutation {
            login(input:{
              email:"${adminUser.email}",
              password:"${adminUser.password}",
            }) {
              ok
              error
              token
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { login },
              },
            } = res;
            expect(login.ok).toBe(true);
            expect(login.error).toBe(null);
            expect(login.token).toEqual(expect.any(String));
            adminJwtToken = login.token;
          });
      });

      it('should not be able to login with wrong credentials', () => {
        return publicTest(`
          mutation {
            login(input:{
              email:"${freeUser.email}",
              password:"xxx",
            }) {
              ok
              error
              token
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: { login },
              },
            } = res;
            expect(login.ok).toBe(false);
            expect(login.error).toBe('Wrong password');
            expect(login.token).toBe(null);
          });
      });
    });

    describe('userProfile', () => {
      let userId: number;

      beforeAll(async () => {
        const user = await usersRepository.find();
        userId = user[0].id;
      });

      it("should see a user's profile", () => {
        return privateAdminTest(`
          {
            userProfile(userId:${userId}){
              ok
              error
              user {
                id
              }
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  userProfile: {
                    ok,
                    error,
                    user: { id },
                  },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
            expect(id).toBe(userId);
          });
      });

      it('should not find a profile', () => {
        return privateAdminTest(`
          {
            userProfile(userId:666){
              ok
              error
              user {
                id
              }
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  userProfile: { ok, error, user },
                },
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe('User Not Found');
            expect(user).toBe(null);
          });
      });

      it('should not find a profile', () => {
        return privateFreeTest(`
          {
            userProfile(userId:${userId}){
              ok
              error
              user {
                id
              }
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: { data, errors },
            } = res;
            expect(data).toBe(null);
            expect(errors.length).not.toBe(0);
          });
      });
    });

    describe('me', () => {
      it('should find my profile', () => {
        return privateFreeTest(`
          {
            me {
              email
              username
              role
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  me: { email, username, role },
                },
              },
            } = res;
            expect(email).toBe(freeUser.email);
            expect(username).toBe(freeUser.username);
            expect(role).toBe('Free');
          });
      });

      it('should not allow logged out user', () => {
        return publicTest(`
          {
            me {
              email
              username
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: { errors },
            } = res;
            const [error] = errors;
            expect(error.message).toBe('Forbidden resource');
          });
      });
    });

    describe('editProfile', () => {
      const NEW_EMAIL = 'nico@new.com';
      it('should change email', () => {
        return privateFreeTest(`
            mutation {
              editProfile(input:{
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  editProfile: { ok, error },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
          });
      });

      it('should have new email', () => {
        return privateFreeTest(`
          {
            me {
              email
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  me: { email },
                },
              },
            } = res;
            expect(email).toBe(NEW_EMAIL);
          });
      });
    });

    describe('verifyEmail', () => {
      let verificationCode: string;
      beforeAll(async () => {
        const [verification] = await verificationsRepository.find();
        verificationCode = verification.code;
      });
      it('should verify email', () => {
        return publicTest(`
          mutation {
            verifyEmail(input:{
              code:"${verificationCode}"
            }){
              ok
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  verifyEmail: { ok, error },
                },
              },
            } = res;
            expect(ok).toBe(true);
            expect(error).toBe(null);
          });
      });

      it('should fail on verification code not found', () => {
        return publicTest(`
          mutation {
            verifyEmail(input:{
              code:"xxxxx"
            }){
              ok
              error
            }
          }
        `)
          .expect(200)
          .expect((res) => {
            const {
              body: {
                data: {
                  verifyEmail: { ok, error },
                },
              },
            } = res;
            expect(ok).toBe(false);
            expect(error).toBe('Verification not found.');
          });
      });
    });
  });

  describe('NeedModule', () => {
    describe('Need', () => {
      describe('createNeed', () => {
        it.todo('should create need');
        it.todo('should fail if not logged in');
      });
      describe('myNeed', () => {
        it.todo('should find my need');
        it.todo('should fail if not logged in');
      });
      describe('deleteNeed', () => {
        it.todo('should delete need');
        it.todo('should fail if not logged in');
        it.todo('should fail if not my need');
        it.todo('should fail if not exists');
      });
    });
    describe('NeedQuestion', () => {
      describe('createNeedQuestion', () => {
        it.todo('should create needQuestion');
        it.todo('should fail if not logged in');
        it.todo('should fail if not admin');
      });
      describe('allNeedQuestions', () => {
        it.todo('should find all needQuestions');
        it.todo('should fail if not logged in');
      });
      describe('findNeedQuestionsByStage', () => {
        it.todo('should find all needQuestions by stage');
        it.todo('should fail if not logged in');
        it.todo('should find empty stage');
      });
      describe('editNeedQuestion', () => {
        it.todo('should edit stage');
        it.todo('should edit subStage');
        it.todo('should edit content');
        it.todo('should fail if not exists');
        it.todo('should fail if not admin');
        it.todo('should fail if not logged in');
      });
      describe('deleteNeedQuestion', () => {
        it.todo('should edit stage');
        it.todo('should fail if not exists');
        it.todo('should fail if not admin');
        it.todo('should fail if not logged in');
      });
    });
    describe('MeasureNeed', () => {
      describe('createMeasureNeed', () => {
        it.todo('should create measureNeed');
        it.todo('should fail if need not exists');
        it.todo('should fail if need question not exists');
        it.todo('should fail if not mine');
        it.todo('should fail if not logged in');
      });
      describe('findMeasureNeed', () => {
        it.todo('should find measureNeed');
        it.todo('should fail if not exists');
        it.todo('should fail if not mine');
        it.todo('should fail if not logged in');
      });
      describe('findMeasureNeedsByNeed', () => {
        it.todo('should find measureNeeds');
        it.todo('should fail if not exists');
        it.todo('should fail if not mine');
        it.todo('should fail if not logged in');
      });
      describe('editMeasureNeed', () => {
        it.todo('should edit measureNeeds score');
        it.todo('should fail if not exists');
        it.todo('should fail if not mine');
        it.todo('should fail if not logged in');
      });
      describe('deleteMeasureNeed', () => {
        it.todo('should delete measureNeeds');
        it.todo('should fail if not exists');
        it.todo('should fail if not mine');
        it.todo('should fail if not logged in');
      });
    });
  });
});
