import { Injectable, NotFoundException } from '@nestjs/common'
import { UserEntity } from './entities/user.entity'
import { UserRepository } from './repositories/user.repository'
import { IUser } from '@nest-microservices/interfaces'
import { BuyCourseSaga } from './sagas/buy-course.saga'
import { RMQService } from 'nestjs-rmq'
import { UserEventEmitter } from './user.event-emitter'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEventEmitter
  ) {}

  async changeProfile(user: Pick<IUser, 'displayName'>, id: string) {
    const existingUser = await this.userRepository.findUserById(id)
    if (!existingUser) {
      throw new NotFoundException('User not found!')
    }
    const userEntity = new UserEntity(existingUser).updateProfile(user.displayName)
    await this.updateUser(userEntity)
    return {}
  }

  async buyCourse(userId: string, courseId: string) {
    const existingUser = await this.userRepository.findUserById(userId)
    if (!existingUser) {
      throw new Error('User does not exist!')
    }
    const userEntity = new UserEntity(existingUser)
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)
    const { user, paymentLink } = await saga.getState().pay()
    await this.updateUser(user)
    return { paymentLink }
  }

  async checkPayment(userId: string, courseId: string) {
    const existingUser = await this.userRepository.findUserById(userId)
    if (!existingUser) {
      throw new Error('User does not exist!')
    }
    const userEntity = new UserEntity(existingUser)
    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService)
    const { user, status } = await saga.getState().checkPayment()
    await this.updateUser(user)
    return { status }
  }

  private async updateUser(user) {
    return await Promise.all([
      this.userEventEmitter.handle(user),
      this.userRepository.updateUser(user)
    ])
  }
}
