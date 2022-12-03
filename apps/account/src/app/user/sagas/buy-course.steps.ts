import { BuyCourseSageState } from './buy-course.state'
import { UserEntity } from '../entities/user.entity'
import { CourseGetCourse, PaymentGenerateLink } from '@nest-microservices/contracts'
import { PurchaseState } from '@nest-microservices/interfaces'
import { PaymentCheck } from '../../../../../../libs/contracts/src/lib/payment/payment.check'

export class BuyCourseStepsSagaStateStarted extends BuyCourseSageState {
  cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Cancelled, this.saga.courseId)
    return Promise.resolve({ user: this.saga.user })
  }

  checkPayment(): Promise<{ user: UserEntity }> {
    throw new Error('Cannot check payment which is not started!')
  }

  async pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    const { course } = await this.saga.rmqService.send<
      CourseGetCourse.Request,
      CourseGetCourse.Response
    >(CourseGetCourse.topic, { courseId: this.saga.courseId })
    if (!course) {
      throw new Error('Course not found!')
    }
    if (course.price === 0) {
      this.saga.setState(PurchaseState.Purchased, course._id)
      return { paymentLink: null, user: this.saga.user }
    }
    const { paymentLink } = await this.saga.rmqService.send<
      PaymentGenerateLink.Request,
      PaymentGenerateLink.Response
    >(PaymentGenerateLink.topic, {
      courseId: course._id,
      sum: course.price,
      userId: this.saga.user._id
    })
    this.saga.setState(PurchaseState.WaitingForPayment, course._id)
    return Promise.resolve({ paymentLink, user: this.saga.user })
  }
}

export class BuCourseSagaStateInProcess extends BuyCourseSageState {
  cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Cancelled, this.saga.courseId)
    return Promise.resolve({ user: this.saga.user })
  }

  async checkPayment(): Promise<{ user: UserEntity }> {
    return Promise.resolve({ user: undefined })
  }

  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    return Promise.resolve({ paymentLink: '', user: undefined })
  }
}
