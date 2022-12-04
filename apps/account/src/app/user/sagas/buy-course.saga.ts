import { UserEntity } from '../entities/user.entity'
import { RMQService } from 'nestjs-rmq'
import { PurchaseState } from '@nest-microservices/interfaces'
import { BuyCourseSageState } from './buy-course.state'
import {
  BuCourseSagaStateCanceled,
  BuCourseSagaStatePurchased,
  BuCourseSagaStateWaitingForPayment,
  BuyCourseStepsSagaStateStarted
} from './buy-course.steps'

export class BuyCourseSaga {
  private state: BuyCourseSageState

  constructor(public user: UserEntity, public courseId: string, public rmqService: RMQService) {}

  setState(state: PurchaseState, courseId: string) {
    switch (state) {
      case PurchaseState.Started:
        this.state = new BuyCourseStepsSagaStateStarted()
        break
      case PurchaseState.WaitingForPayment:
        this.state = new BuCourseSagaStateWaitingForPayment()
        break
      case PurchaseState.Purchased:
        this.state = new BuCourseSagaStatePurchased()
        break
      case PurchaseState.Cancelled:
        this.state = new BuCourseSagaStateCanceled()
        break
    }
    this.state.setContext(this)
    this.user.setCourseState(courseId, state)
  }

  getState() {
    return this.state
  }
}
