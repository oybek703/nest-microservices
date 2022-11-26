import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { User, userSchema } from './models/user.model'
import { UserRepository } from './repositories/user.repository'

@Module({
  providers: [UserRepository],
  imports: [MongooseModule.forFeature([{ name: User.name, schema: userSchema }])],
  exports: [UserRepository]
})
export class UserModule {}
