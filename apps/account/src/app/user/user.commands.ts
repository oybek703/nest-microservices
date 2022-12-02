import { Body, Controller } from '@nestjs/common'
import { RMQRoute, RMQValidate } from 'nestjs-rmq'
import { AccountChangeProfile } from '@nest-microservices/contracts'
import { UserRepository } from './repositories/user.repository'
import { NotFoundError } from 'rxjs'
import { UserEntity } from './entities/user.entity'

@Controller()
export class UserCommands {
  constructor(private readonly userRepository: UserRepository) {}

  @RMQValidate()
  @RMQRoute(AccountChangeProfile.topic)
  async userInfo(
    @Body() { user, id }: AccountChangeProfile.Request
  ): Promise<AccountChangeProfile.Response> {
    const existingUser = await this.userRepository.findUserById(id)
    if (!existingUser) {
      throw new NotFoundError('User not found!')
    }
    const userEntity = new UserEntity(existingUser).updateProfile(user.displayName)
    await this.userRepository.updateUser(userEntity)
    return {}
  }
}
