import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '@nestjs/config'
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq'
import { AuthModule } from './auth.module'
import { UserModule } from '../user/user.module'
import { MongooseModule } from '@nestjs/mongoose'
import { getMongoConfig } from '../configs/mongo.config'
import { INestApplication } from '@nestjs/common'
import { AccountLogin, AccountRegister } from '@nest-microservices/contracts'
import { UserRepository } from '../user/repositories/user.repository'

const authLogin: AccountLogin.Request = {
  email: 'temp@gmail.com',
  password: '1'
}

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Tester'
}

describe('AuthController', function () {
  let app: INestApplication
  let userRepository: UserRepository
  let rmqService: RMQTestService

  beforeAll(async function () {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.account.env' }),
        RMQModule.forTest({}),
        AuthModule,
        UserModule,
        MongooseModule.forRootAsync(getMongoConfig())
      ]
    }).compile()
    app = module.createNestApplication()
    userRepository = app.get<UserRepository>(UserRepository)
    rmqService = app.get<RMQTestService>(RMQService)
    await app.init()
  })

  it('should register new user', async function () {
    const res = await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
      AccountRegister.topic,
      authRegister
    )
    expect(res.email).toEqual(authRegister.email)
  })

  it('should login with existing user', async function () {
    const res = await rmqService.triggerRoute<AccountLogin.Request, AccountLogin.Response>(
      AccountLogin.topic,
      authLogin
    )
    expect(res.access_token).toBeDefined()
  })

  afterAll(async function () {
    await userRepository.deleteUser(authLogin.email)
    await app.close()
  })
})
