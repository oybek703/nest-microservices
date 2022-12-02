import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ConfigModule } from '@nestjs/config'
import { getMongoConfig } from './configs/mongo.config'
import { MongooseModule } from '@nestjs/mongoose'
import { RMQModule } from 'nestjs-rmq'
import { getRMQConfig } from './configs/rmq.config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: 'envs/.account.env' }),
    RMQModule.forRootAsync(getRMQConfig()),
    AuthModule,
    UserModule,
    MongooseModule.forRootAsync(getMongoConfig())
  ]
})
export class AppModule {}
