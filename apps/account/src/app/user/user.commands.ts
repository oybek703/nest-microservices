import { Body, Controller } from '@nestjs/common'
import { RMQRoute, RMQService, RMQValidate } from 'nestjs-rmq'
import {
  AccountBuyCourse,
  AccountChangeProfile,
  AccountCheckPayment
} from '@nest-microservices/contracts'
import { UserRepository } from './repositories/user.repository'
import { NotFoundError } from 'rxjs'
import { UserEntity } from './entities/user.entity'
import { BuyCourseSaga } from './sagas/buy-course.saga'

@Controller()
export class UserCommands {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService
  ) {}

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

  @RMQValidate()
  @RMQRoute(AccountBuyCourse.topic)
  async buyCourse(
    @Body() { userId, courseId }: AccountBuyCourse.Request
  ): Promise<AccountBuyCourse.Response> {
    const existingUser = await this.userRepository.findUserById(userId)
    if (!existingUser) {
      throw new Error('User does not exist!')
    }
    const userEntity = new UserEntity(existingUser)
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)
    const { user, paymentLink } = await saga.getState().pay()
    await this.userRepository.updateUser(user)
    return { paymentLink }
  }

  @RMQValidate()
  @RMQRoute(AccountCheckPayment.topic)
  async checkPayment(
    @Body() { userId, courseId }: AccountCheckPayment.Request
  ): Promise<AccountCheckPayment.Response> {
    const existingUser = await this.userRepository.findUserById(userId)
    if (!existingUser) {
      throw new Error('User does not exist!')
    }
    const userEntity = new UserEntity(existingUser)
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)
    const { user, status } = await saga.getState().checkPayment()
    await this.userRepository.updateUser(user)
    return { status }
  }
}
