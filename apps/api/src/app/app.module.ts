import { Module } from '@nestjs/common'
import { AuthController } from './controller/auth.controller'
import { ConfigModule } from '@nestjs/config'
import { RMQModule } from 'nestjs-rmq'
import { getRMQConfig } from './configs/rmq.config'
import { JwtModule } from '@nestjs/jwt'
import { getJWTConfig } from './configs/jwt.config'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { UserController } from './controller/user.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'envs/.api.env', isGlobal: true }),
    RMQModule.forRootAsync(getRMQConfig()),
    JwtModule.registerAsync(getJWTConfig()),
    PassportModule,
    ScheduleModule.forRoot()
  ],
  controllers: [AuthController, UserController]
})
export class AppModule {}
