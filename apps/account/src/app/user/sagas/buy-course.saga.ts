import { UserEntity } from '../entities/user.entity'
import { RMQService } from 'nestjs-rmq'
import { PurchaseState } from '@nest-microservices/interfaces'
import { BuyCourseSageState } from './buy-course.state'

export class BuyCourseSaga {
  private state: BuyCourseSageState

  constructor(public user: UserEntity, public courseId: string, public rmqService: RMQService) {}

  setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        break
      case PurchaseState.WaitingForPayment:
        break
      case PurchaseState.Purchased:
        break
      case PurchaseState.Cancelled:
        break
    }
    this.state.setContext(this)
    this.user.updateCourseState(courseId, state)
  }

  getState() {
    return this.state
  }
}
