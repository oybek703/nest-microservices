import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, userSchema } from './models/user.model'
import { UserRepository } from './repositories/user.repository'
import { UserCommands } from './user.commands'
import { UserQueries } from './user.queries'
import { UserService } from './user.service'
import { UserEventEmitter } from './user.event-emitter'

@Module({
  providers: [UserRepository, UserService, UserEventEmitter],
  imports: [MongooseModule.forFeature([{ name: User.name, schema: userSchema }])],
  exports: [UserRepository],
  controllers: [UserCommands, UserQueries]
})
export class UserModule {}
