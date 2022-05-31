import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, getRepository, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Verification } from 'src/users/entities/verification.entity';
import { Need } from 'src/needs/entities/need.entity';
import { NeedQuestion } from 'src/needs/entities/need-question.entity';
import { MeasureNeed } from 'src/needs/entities/measure-need.entity';
import { Target } from 'src/target/entities/target.entity';
import { TargetName } from 'src/target/entities/target-name.entity';
import { MeasureTarget } from 'src/target/entities/measuare-target.entity';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  };
});

const GRAPHQL_ENDPOINT = '/graphql';

let freeUserArgs: User;

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
  let targetsRepository: Repository<Target>;
  let targetNamesRepository: Repository<TargetName>;
  let measureTargetsRepository: Repository<MeasureTarget>;
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
    targetsRepository = module.get<Repository<Target>>(
      getRepositoryToken(Target),
    );
    targetNamesRepository = module.get<Repository<TargetName>>(
      getRepositoryToken(TargetName),
    );
    measureTargetsRepository = module.get<Repository<MeasureTarget>>(
      getRepositoryToken(MeasureTarget),
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
      beforeAll(async () => {
        freeUserArgs = await usersRepository.findOne({
          where: { email: freeUser.email },
        });
      });

      it("should see a user's profile", () => {
        return privateAdminTest(`
          {
            userProfile(userId:${freeUserArgs.id}){
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
            expect(id).toBe(freeUserArgs.id);
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
            userProfile(userId:${freeUserArgs.id}){
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
            expect(errors).not.toHaveLength(0);
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
    const date1 = '2022-5-25';
    const date2 = '2022-5-26';
    const date3 = '2022-5-27';
    let needQuestionId1: number;
    let needQuestionId2: number;
    let needQuestionId3: number;

    describe('Need', () => {
      describe('findNeedByDate', () => {
        it('should create need1', () => {
          return privateFreeTest(`
          query {
            findNeedByDate(input:{
              date: "${date1}"
            }) {
              ok
              error
              need {
                id
                date
              }
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findNeedByDate: { ok, error, need },
                  },
                },
              } = res;
              expect(error).toBe(null);
              expect(ok).toBe(true);
              expect(need).toHaveProperty('id');
              expect(need).toHaveProperty('date');
            });
        });

        it('should create need2', () => {
          return privateFreeTest(`
          query {
            findNeedByDate(input:{
              date: "${date2}"
            }) {
              ok
              error
              need {
                id
                date
              }
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findNeedByDate: { ok, error, need },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(need).toHaveProperty('id');
              expect(need).toHaveProperty('date');
            });
        });

        it('should create need3', () => {
          return privateFreeTest(`
          query {
            findNeedByDate(input:{
              date: "${date3}"
            }) {
              ok
              error
              need {
                id
                date
              }
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findNeedByDate: { ok, error, need },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(need).toHaveProperty('id');
              expect(need).toHaveProperty('date');
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          query {
            findNeedByDate(input:{
              date: "${date1}"
            }) {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('myNeed', () => {
        let testNeeds: Need[];

        beforeAll(async () => {
          testNeeds = await needsRepository.find({ select: ['id'] });
        });

        it('should find my need', () => {
          return privateFreeTest(`
          query {
            myNeed {
              ok
              error
              needs {
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
                    myNeed: { ok, error, needs },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(needs).toEqual(testNeeds);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          query {
            myNeed {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('deleteNeed', () => {
        it('should delete need3', () => {
          return privateFreeTest(`
          mutation {
            deleteNeed(input:{
              date: "${date3}"
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
                    deleteNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
          mutation {
            deleteNeed(input:{
              date: "${date3}"
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
                    deleteNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Need not found');
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            deleteNeed(input:{
              date: "${date2}"
            }) {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });
    });

    describe('NeedQuestion', () => {
      const needQuestionArgs1 = {
        stage: 1,
        subStage: 1,
        content: 'content number 1',
      };
      const needQuestionArgs2 = {
        stage: 1,
        subStage: 1,
        content: 'content number 2',
      };
      const needQuestionArgs3 = {
        stage: 2,
        subStage: 1,
        content: 'content number 3',
      };

      describe('createNeedQuestion', () => {
        it('should create needQuestion 1', () => {
          return privateAdminTest(`
          mutation {
            createNeedQuestion(input:{
              stage: ${needQuestionArgs1.stage},
              subStage: ${needQuestionArgs1.subStage},
              content: "${needQuestionArgs1.content}"
            }) {
              ok
              error
              needQuestionId
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createNeedQuestion: { ok, error, needQuestionId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof needQuestionId).toBe('number');
              needQuestionId1 = needQuestionId;
            });
        });

        it('should create needQuestion 2', () => {
          return privateAdminTest(`
          mutation {
            createNeedQuestion(input:{
              stage: ${needQuestionArgs2.stage},
              subStage: ${needQuestionArgs2.subStage},
              content: "${needQuestionArgs2.content}"
            }) {
              ok
              error
              needQuestionId
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createNeedQuestion: { ok, error, needQuestionId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof needQuestionId).toBe('number');
              needQuestionId2 = needQuestionId;
            });
        });

        it('should create needQuestion 3', () => {
          return privateAdminTest(`
          mutation {
            createNeedQuestion(input:{
              stage: ${needQuestionArgs3.stage},
              subStage: ${needQuestionArgs3.subStage},
              content: "${needQuestionArgs3.content}"
            }) {
              ok
              error
              needQuestionId
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createNeedQuestion: { ok, error, needQuestionId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof needQuestionId).toBe('number');
              needQuestionId3 = needQuestionId;
            });
        });

        it('should fail if not admin', () => {
          return privateFreeTest(`
          mutation {
            createNeedQuestion(input:{
              stage: ${needQuestionArgs3.stage},
              subStage: ${needQuestionArgs3.subStage},
              content: "${needQuestionArgs3.content}"
            }) {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            createNeedQuestion(input:{
              stage: ${needQuestionArgs3.stage},
              subStage: ${needQuestionArgs3.subStage},
              content: "${needQuestionArgs3.content}"
            }) {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('allNeedQuestions', () => {
        let testNeedQuestions: NeedQuestion[];

        beforeAll(async () => {
          testNeedQuestions = await needQuestionsRepository.find({
            select: ['id'],
          });
        });

        it('should find all needQuestions', () => {
          return privateFreeTest(`
        query {
          allNeedQuestions {
            ok
            error
            needQuestions {
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
                    allNeedQuestions: { ok, error, needQuestions },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(needQuestions).toEqual(testNeedQuestions);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          query {
            allNeedQuestions {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('findNeedQuestionsByStage', () => {
        let testNeedQuestions: NeedQuestion[];

        beforeAll(async () => {
          testNeedQuestions = await needQuestionsRepository.find({
            where: { stage: needQuestionArgs1.stage },
            select: ['id'],
          });
        });

        it('should find all needQuestions by stage', () => {
          return privateFreeTest(`
          query {
            findNeedQuestionsByStage(input:{
              stage: ${needQuestionArgs1.stage}
            }) {
              ok
              error
              needQuestions {
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
                    findNeedQuestionsByStage: { ok, error, needQuestions },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(needQuestions).toEqual(testNeedQuestions);
            });
        });

        it('should find empty stage', () => {
          return privateFreeTest(`
          query {
            findNeedQuestionsByStage(input:{
              stage: 666
            }) {
              ok
              error
              needQuestions {
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
                    findNeedQuestionsByStage: { ok, error, needQuestions },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(needQuestions).toHaveLength(0);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          query {
            findNeedQuestionsByStage(input:{
              stage: ${needQuestionArgs1.stage}
            }) {
              ok
              error
              needQuestions {
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
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('editNeedQuestion', () => {
        let testNeedQuestion: NeedQuestion;

        beforeAll(async () => {
          testNeedQuestion = await needQuestionsRepository.findOne({
            select: ['id'],
          });
        });

        it('should edit stage', () => {
          return privateAdminTest(`
            mutation {
              editNeedQuestion(input:{
                needQuestionId:${testNeedQuestion.id},
                stage: 2
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
                    editNeedQuestion: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should edit subStage', () => {
          return privateAdminTest(`
            mutation {
              editNeedQuestion(input:{
                needQuestionId:${testNeedQuestion.id},
                subStage: 2
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
                    editNeedQuestion: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should edit content', () => {
          return privateAdminTest(`
            mutation {
              editNeedQuestion(input:{
                needQuestionId:${testNeedQuestion.id},
                content: "edited content"
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
                    editNeedQuestion: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateAdminTest(`
            mutation {
              editNeedQuestion(input:{
                needQuestionId: 666,
                content: "edited content"
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
                    editNeedQuestion: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Need question not found');
            });
        });

        it('should fail if not admin', () => {
          return privateFreeTest(`
          mutation {
            editNeedQuestion(input:{
              needQuestionId:${testNeedQuestion.id},
              stage: 2
            }){
              ok
              error
            }
          }
        `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            editNeedQuestion(input:{
              needQuestionId:${testNeedQuestion.id},
              stage: 2
            }){
              ok
              error
            }
          }
        `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('deleteNeedQuestion', () => {
        let testNeedQuestion: NeedQuestion;

        beforeAll(async () => {
          testNeedQuestion = await needQuestionsRepository.findOne({
            where: { id: 3 },
            select: ['id'],
          });
        });

        it('should delete need question3', () => {
          return privateAdminTest(`
            mutation {
              deleteNeedQuestion(input:{
                needQuestionId:${testNeedQuestion.id},
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
                    deleteNeedQuestion: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateAdminTest(`
            mutation {
              deleteNeedQuestion(input:{
                needQuestionId: 666
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
                    deleteNeedQuestion: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Need question not found');
            });
        });

        it('should fail if not admin', () => {
          return privateFreeTest(`
          mutation {
            deleteNeedQuestion(input:{
              needQuestionId:${testNeedQuestion.id}
            }){
              ok
              error
            }
          }
        `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            deleteNeedQuestion(input:{
              needQuestionId:${testNeedQuestion.id}
            }){
              ok
              error
            }
          }
        `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });
    });

    describe('MeasureNeed', () => {
      let measureNeedId1: number;
      let measureNeedId2: number;
      let measureNeedId3: number;

      describe('createMeasureNeed', () => {
        it('should create measureNeed1', () => {
          return privateFreeTest(`
            mutation {
              createMeasureNeed(input:{
                date:"${date1}",
                needQuestionId:${needQuestionId1},
                score: 1
              }){
                ok
                error
                measureNeedId
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createMeasureNeed: { ok, error, measureNeedId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof measureNeedId).toBe('number');
              measureNeedId1 = measureNeedId;
            });
        });

        it('should create measureNeed2', () => {
          return privateFreeTest(`
            mutation {
              createMeasureNeed(input:{
                date:"${date1}",
                needQuestionId:${needQuestionId2},
                score: 2
              }){
                ok
                error
                measureNeedId
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createMeasureNeed: { ok, error, measureNeedId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof measureNeedId).toBe('number');
              measureNeedId2 = measureNeedId;
            });
        });

        it('should create measureNeed3', () => {
          return privateFreeTest(`
            mutation {
              createMeasureNeed(input:{
                date:"${date2}",
                needQuestionId:${needQuestionId1},
                score: 3
              }){
                ok
                error
                measureNeedId
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createMeasureNeed: { ok, error, measureNeedId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof measureNeedId).toBe('number');
              measureNeedId3 = measureNeedId;
            });
        });

        it('should fail if need question not exists', () => {
          return privateFreeTest(`
            mutation {
              createMeasureNeed(input:{
                date:"${date1}",
                needQuestionId:${needQuestionId3},
                score: 1
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
                    createMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Need question not found');
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            createMeasureNeed(input:{
              date:"${date1}",
              needQuestionId:${needQuestionId1},
              score: 1
            }){
              ok
              error
            }
          }
        `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('findMeasureNeed', () => {
        let testMeasureNeed: MeasureNeed;

        beforeAll(async () => {
          testMeasureNeed = await measureNeedsRepository.findOne({
            where: { id: measureNeedId1 },
            select: ['id', 'score'],
          });
        });

        it('should find measureNeed', () => {
          return privateFreeTest(`
            query {
              findMeasureNeed(input:{
                measureNeedId: ${measureNeedId1}
              }) {
                ok
                error
                measureNeed {
                  id
                  score
                }
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findMeasureNeed: { ok, error, measureNeed },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(measureNeed).toEqual(testMeasureNeed);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            query {
              findMeasureNeed(input:{
                measureNeedId:666
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
                    findMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Measure need not found');
            });
        });

        it('should fail if not mine', () => {
          return privateAdminTest(`
            query {
              findMeasureNeed(input:{
                measureNeedId:${measureNeedId1}
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
                    findMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't find measure need that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          query {
            findMeasureNeed(input:{
              measureNeedId:${measureNeedId1}
            }){
              ok
              error
            }
          }
        `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('findMeasureNeedsByNeed', () => {
        it('should find measureNeeds', () => {
          return privateFreeTest(`
            query {
              findMeasureNeedsByNeed(input:{
                date: "${date1}"
              }) {
                ok
                error
                measureNeeds {
                  id
                  score
                }
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findMeasureNeedsByNeed: { ok, error, measureNeeds },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              measureNeeds.forEach((measureNeed: MeasureTarget) => {
                expect(measureNeed).toHaveProperty('id');
                expect(measureNeed).toHaveProperty('score');
              });
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            query {
              findMeasureNeedsByNeed(input:{
                date: "2000-01-01"
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
                    findMeasureNeedsByNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Need not found');
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
              query {
                findMeasureNeedsByNeed(input:{
                  date: "${date1}"
                }) {
                  ok
                  error
                }
              }
            `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('editMeasureNeed', () => {
        it('should edit measureNeeds score', () => {
          return privateFreeTest(`
            mutation {
              editMeasureNeed(input:{
                measureNeedId: ${measureNeedId1},
                score: 5
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
                    editMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            mutation {
              editMeasureNeed(input:{
                measureNeedId: 666,
                score: 5
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
                    editMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Measure need not found');
            });
        });

        it('should fail if not mine', () => {
          return privateAdminTest(`
            mutation {
              editMeasureNeed(input:{
                measureNeedId:  ${measureNeedId1},
                score: 5
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
                    editMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't edit a measure need that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            mutation {
              editMeasureNeed(input:{
                measureNeedId: 666,
                score: 5
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('deleteMeasureNeed', () => {
        it('should delete measureNeed3', () => {
          return privateFreeTest(`
            mutation {
              deleteMeasureNeed(input:{
                measureNeedId: ${measureNeedId3}
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
                    deleteMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            mutation {
              deleteMeasureNeed(input:{
                measureNeedId: ${measureNeedId3}
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
                    deleteMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Measure need not found');
            });
        });

        it('should fail if not mine', () => {
          return privateAdminTest(`
            mutation {
              deleteMeasureNeed(input:{
                measureNeedId: ${measureNeedId2}
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
                    deleteMeasureNeed: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't delete a measure need that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            mutation {
              deleteMeasureNeed(input:{
                measureNeedId: ${measureNeedId2}
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });
    });
  });

  describe('TargetModule', () => {
    const date1 = '2022-5-25';
    const date2 = '2022-5-26';
    const date3 = '2022-5-27';
    let targetNameId1: number;
    let targetNameId2: number;
    let targetNameId3: number;

    describe('Target', () => {
      describe('findTargetByDate', () => {
        it('should create target1', () => {
          return privateFreeTest(`
          query {
            findTargetByDate(input:{
              date: "${date1}"
            }) {
              ok
              error
              target {
                id
                date
              }
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findTargetByDate: { ok, error, target },
                  },
                },
              } = res;
              expect(error).toBe(null);
              expect(ok).toBe(true);
              expect(target).toHaveProperty('id');
              expect(target).toHaveProperty('date');
            });
        });

        it('should create target2', () => {
          return privateFreeTest(`
          query {
            findTargetByDate(input:{
              date: "${date2}"
            }) {
              ok
              error
              target {
                id
                date
              }
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findTargetByDate: { ok, error, target },
                  },
                },
              } = res;
              expect(error).toBe(null);
              expect(ok).toBe(true);
              expect(target).toHaveProperty('id');
              expect(target).toHaveProperty('date');
            });
        });

        it('should create target3', () => {
          return privateFreeTest(`
          query {
            findTargetByDate(input:{
              date: "${date3}"
            }) {
              ok
              error
              target {
                id
                date
              }
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findTargetByDate: { ok, error, target },
                  },
                },
              } = res;
              expect(error).toBe(null);
              expect(ok).toBe(true);
              expect(target).toHaveProperty('id');
              expect(target).toHaveProperty('date');
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          query {
            findTargetByDate(input:{
              date: "${date1}"
            }) {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('myTarget', () => {
        let testTargets: Target[];

        beforeAll(async () => {
          testTargets = await targetsRepository.find({ select: ['id'] });
        });

        it('should find my target', () => {
          return privateFreeTest(`
          query {
            myTarget {
              ok
              error
              targets {
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
                    myTarget: { ok, error, targets },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(targets).toEqual(testTargets);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          query {
            myTarget {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('deleteTarget', () => {
        it('should delete target3', () => {
          return privateFreeTest(`
          mutation {
            deleteTarget(input:{
              date: "${date3}"
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
                    deleteTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
          mutation {
            deleteTarget(input:{
              date: "${date3}"
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
                    deleteTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Target not found');
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            deleteTarget(input:{
              date: "${date2}"
            }) {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });
    });

    describe('TargetName', () => {
      const targetNameArgs1 = {
        positive: true,
        content: 'target number 1',
      };
      const targetNameArgs2 = {
        positive: false,
        content: 'target number 1',
      };
      const targetNameArgs3 = {
        positive: true,
        content: 'target number 1',
      };

      describe('createTargetName', () => {
        it('should create target name 1', () => {
          return privateFreeTest(`
          mutation {
            createTargetName(input:{
              positive: ${targetNameArgs1.positive},
              content: "${targetNameArgs1.content}"
            }) {
              ok
              error
              targetNameId
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createTargetName: { ok, error, targetNameId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof targetNameId).toBe('number');
              targetNameId1 = targetNameId;
            });
        });

        it('should create target name 2', () => {
          return privateFreeTest(`
          mutation {
            createTargetName(input:{
              positive: ${targetNameArgs2.positive},
              content: "${targetNameArgs2.content}"
            }) {
              ok
              error
              targetNameId
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createTargetName: { ok, error, targetNameId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof targetNameId).toBe('number');
              targetNameId2 = targetNameId;
            });
        });

        it('should create target name 3', () => {
          return privateFreeTest(`
          mutation {
            createTargetName(input:{
              positive: ${targetNameArgs3.positive},
              content: "${targetNameArgs3.content}"
            }) {
              ok
              error
              targetNameId
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createTargetName: { ok, error, targetNameId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof targetNameId).toBe('number');
              targetNameId3 = targetNameId;
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            createTargetName(input:{
              positive: ${targetNameArgs3.positive},
              content: "${targetNameArgs3.content}"
            }) {
              ok
              error
            }
          }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('myTargetNames', () => {
        let testTargetNames: TargetName[];

        beforeAll(async () => {
          testTargetNames = await targetNamesRepository.find({
            select: ['id'],
          });
        });

        it('should find my target names', () => {
          return privateFreeTest(`
            query {
              myTargetNames {
                ok
                error
                targetNames {
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
                    myTargetNames: { ok, error, targetNames },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(targetNames).toEqual(testTargetNames);
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            query {
              myTargetNames {
                ok
                error
              }
            }
            `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('editTargetName', () => {
        let testTargetName: TargetName;

        beforeAll(async () => {
          testTargetName = await targetNamesRepository.findOne({
            select: ['id'],
          });
        });

        it('should edit content', () => {
          return privateFreeTest(`
            mutation {
              editTargetName(input:{
                targetNameId:${testTargetName.id},
                content: "edited target"
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
                    editTargetName: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should edit positive', () => {
          return privateFreeTest(`
            mutation {
              editTargetName(input:{
                targetNameId:${testTargetName.id},
                positive: false
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
                    editTargetName: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            mutation {
              editTargetName(input:{
                targetNameId:666,
                positive: false
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
                    editTargetName: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Target name not found');
            });
        });

        it('should fail if not owned', () => {
          return privateAdminTest(`
            mutation {
              editTargetName(input:{
                targetNameId:${testTargetName.id},
                positive: false
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
                    editTargetName: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't edit a target name that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            mutation {
              editTargetName(input:{
                targetNameId:${testTargetName.id},
                positive: false
              }){
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('deleteTargetName', () => {
        let testTargetName3: TargetName;
        let testTargetName2: TargetName;

        beforeAll(async () => {
          testTargetName3 = await targetNamesRepository.findOne({
            where: { id: 3 },
            select: ['id'],
          });

          testTargetName2 = await targetNamesRepository.findOne({
            where: { id: 2 },
            select: ['id'],
          });
        });

        it('should delete target name 3', () => {
          return privateFreeTest(`
            mutation {
              deleteTargetName(input:{
                targetNameId:${testTargetName3.id},
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
                    deleteTargetName: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            mutation {
              deleteTargetName(input:{
                targetNameId:666,
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
                    deleteTargetName: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Target name not found');
            });
        });

        it('should fail if not own', () => {
          return privateAdminTest(`
            mutation {
              deleteTargetName(input:{
                targetNameId:${testTargetName2.id},
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
                    deleteTargetName: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't delete a target name that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
          mutation {
            deleteTargetName(input:{
              targetNameId:${testTargetName2.id},
            }){
              ok
              error
            }
          }
        `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });
    });

    describe('MeasureTarget', () => {
      let measureTargetId1: number;
      let measureTargetId2: number;
      let measureTargetId3: number;

      describe('createMeasureTarget', () => {
        it('should create measureTarget1', () => {
          return privateFreeTest(`
            mutation {
              createMeasureTarget(input:{
                date:"${date1}",
                targetNameId:${targetNameId1},
                time: 1
              }){
                ok
                error
                measureTargetId
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createMeasureTarget: { ok, error, measureTargetId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof measureTargetId).toBe('number');
              measureTargetId1 = measureTargetId;
            });
        });

        it('should create measureTarget2', () => {
          return privateFreeTest(`
            mutation {
              createMeasureTarget(input:{
                date:"${date1}",
                targetNameId:${targetNameId2},
                time: 2
              }){
                ok
                error
                measureTargetId
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createMeasureTarget: { ok, error, measureTargetId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof measureTargetId).toBe('number');
              measureTargetId2 = measureTargetId;
            });
        });

        it('should create measureTarget3', () => {
          return privateFreeTest(`
            mutation {
              createMeasureTarget(input:{
                date:"${date2}",
                targetNameId:${targetNameId1},
                time: 3
              }){
                ok
                error
                measureTargetId
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    createMeasureTarget: { ok, error, measureTargetId },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(typeof measureTargetId).toBe('number');
              measureTargetId3 = measureTargetId;
            });
        });

        it('should fail if target name not exists', () => {
          return privateFreeTest(`
            mutation {
              createMeasureTarget(input:{
                date:"${date2}",
                targetNameId:${targetNameId3},
                time: 3
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
                    createMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Target name not found');
            });
        });

        it('should fail if target name not own', () => {
          return privateAdminTest(`
            mutation {
              createMeasureTarget(input:{
                date:"${date2}",
                targetNameId:${targetNameId1},
                time: 1
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
                    createMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't add a target name that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            mutation {
              createMeasureTarget(input:{
                date:"${date2}",
                targetNameId:${targetNameId1},
                time: 1
              }){
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('findMeasureTarget', () => {
        let testMeasureTarget: MeasureTarget;

        beforeAll(async () => {
          testMeasureTarget = await measureTargetsRepository.findOne({
            where: { id: measureTargetId1 },
            select: ['id', 'time'],
          });
        });

        it('should find measure target', () => {
          return privateFreeTest(`
            query {
              findMeasureTarget(input:{
                measureTargetId: ${measureTargetId1}
              }) {
                ok
                error
                measureTarget {
                  id
                  time
                }
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findMeasureTarget: { ok, error, measureTarget },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              expect(measureTarget).toEqual(testMeasureTarget);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            query {
              findMeasureTarget(input:{
                measureTargetId: 666
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
                    findMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Measure target not found');
            });
        });

        it('should fail if not mine', () => {
          return privateAdminTest(`
            query {
              findMeasureTarget(input:{
                measureTargetId: ${measureTargetId1}
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
                    findMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't find measure target that you dont't own",
              );
            });
        });

        it('should fail if not logged', () => {
          return publicTest(`
            query {
              findMeasureTarget(input:{
                measureTargetId: ${measureTargetId1}
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('findMeasureTargetsByTarget', () => {
        it('should find measure targets', () => {
          return privateFreeTest(`
            query {
              findMeasureTargetsByTarget(input:{
                date: "${date1}"
              }) {
                ok
                error
                measureTargets {
                  id
                  time
                }
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: {
                  data: {
                    findMeasureTargetsByTarget: { ok, error, measureTargets },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
              measureTargets.forEach((measureTarget: MeasureTarget) => {
                expect(measureTarget).toHaveProperty('id');
                expect(measureTarget).toHaveProperty('time');
              });
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            query {
              findMeasureTargetsByTarget(input:{
                date: "2000-01-01"
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
                    findMeasureTargetsByTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Target not found');
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            query {
              findMeasureTargetsByTarget(input:{
                date: "${date1}"
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('editMeasureTarget', () => {
        it('should edit measure target time', () => {
          return privateFreeTest(`
            mutation {
              editMeasureTarget(input:{
                measureTargetId: ${measureTargetId1},
                time: 5
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
                    editMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            mutation {
              editMeasureTarget(input:{
                measureTargetId: 666,
                time: 5
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
                    editMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Measure target not found');
            });
        });

        it('should fail if not mine', () => {
          return privateAdminTest(`
            mutation {
              editMeasureTarget(input:{
                measureTargetId: ${measureTargetId1},
                time: 5
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
                    editMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't edit a measure target that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            mutation {
              editMeasureTarget(input:{
                measureTargetId: ${measureTargetId1},
                time: 5
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });

      describe('deleteMeasureTarget', () => {
        it('should delete measure target3', () => {
          return privateFreeTest(`
            mutation {
              deleteMeasureTarget(input:{
                measureTargetId: ${measureTargetId3}
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
                    deleteMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(true);
              expect(error).toBe(null);
            });
        });

        it('should fail if not exists', () => {
          return privateFreeTest(`
            mutation {
              deleteMeasureTarget(input:{
                measureTargetId: ${measureTargetId3}
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
                    deleteMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe('Measure target not found');
            });
        });

        it('should fail if not mine', () => {
          return privateAdminTest(`
            mutation {
              deleteMeasureTarget(input:{
                measureTargetId: ${measureTargetId2}
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
                    deleteMeasureTarget: { ok, error },
                  },
                },
              } = res;
              expect(ok).toBe(false);
              expect(error).toBe(
                "You can't delete a measure target that you dont't own",
              );
            });
        });

        it('should fail if not logged in', () => {
          return publicTest(`
            mutation {
              deleteMeasureTarget(input:{
                measureTargetId: ${measureTargetId2}
              }) {
                ok
                error
              }
            }
          `)
            .expect(200)
            .expect((res) => {
              const {
                body: { data, errors },
              } = res;
              expect(data).toBe(null);
              expect(errors).not.toHaveLength(0);
            });
        });
      });
    });
  });
});
