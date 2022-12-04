import { AccountLogin, AccountRegister, AccountUserInfo } from '@nest-microservices/contracts'
import { INestApplication } from '@nestjs/common'
import { RMQModule, RMQService, RMQTestService } from 'nestjs-rmq'
import { Test, TestingModule } from '@nestjs/testing'
import { UserRepository } from './repositories/user.repository'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { getMongoConfig } from '../configs/mongo.config'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from './user.module'
import { verify } from 'jsonwebtoken'

const authLogin: AccountLogin.Request = {
  email: 'temp@gmail.com',
  password: '1'
}

const authRegister: AccountRegister.Request = {
  ...authLogin,
  displayName: 'Tester'
}

describe('UserController', function () {
  let app: INestApplication
  let userRepository: UserRepository
  let configService: ConfigService
  let rmqService: RMQTestService
  let token: string
  let userId: string

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
    configService = app.get<ConfigService>(ConfigService)
    await app.init()
    await rmqService.triggerRoute<AccountRegister.Request, AccountRegister.Response>(
      AccountRegister.topic,
      authRegister
    )
    const { access_token } = await rmqService.triggerRoute<
      AccountLogin.Request,
      AccountLogin.Response
    >(AccountLogin.topic, authLogin)
    token = access_token
    const data = await verify(token, configService.get('JWT_SECRET'))
    userId = data['id']
  })

  it('should get user profile with access_token', async function () {
    const res = await rmqService.triggerRoute<AccountUserInfo.Request, AccountUserInfo.Response>(
      AccountUserInfo.topic,
      { id: userId }
    )
    expect(res.profile.displayName).toEqual(authRegister.displayName)
  })

  afterAll(async function () {
    await userRepository.deleteUser(authLogin.email)
    await app.close()
  })
})
