import { BuyCourseSageState } from './buy-course.state'
import { UserEntity } from '../entities/user.entity'
import { CourseGetCourse, PaymentGenerateLink, PaymentStatus } from '@nest-microservices/contracts'
import { PurchaseState } from '@nest-microservices/interfaces'
import { PaymentCheck } from '@nest-microservices/contracts'

export class BuyCourseSagaStateStarted extends BuyCourseSageState {
  cancel(): Promise<{ user: UserEntity }> {
    this.saga.setState(PurchaseState.Cancelled, this.saga.courseId)
    return Promise.resolve({ user: this.saga.user })
  }

  checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
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

export class BuCourseSagaStateWaitingForPayment extends BuyCourseSageState {
  cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Cannot cancel payment which is in process!')
  }

  async checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    const { status } = await this.saga.rmqService.send<PaymentCheck.Request, PaymentCheck.Response>(
      PaymentCheck.topic,
      { courseId: this.saga.courseId, userId: this.saga.user._id }
    )
    if (status === 'cancelled') {
      this.saga.setState(PurchaseState.Cancelled, this.saga.courseId)
      return { user: this.saga.user, status: 'cancelled' }
    }
    if (status === 'success') {
      return { user: this.saga.user, status: 'success' }
    }
    this.saga.setState(PurchaseState.Purchased, this.saga.courseId)
    return Promise.resolve({ user: this.saga.user, status: 'in-process' })
  }

  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Cannot generate link for payment which is in process!')
  }
}

export class BuCourseSagaStatePurchased extends BuyCourseSageState {
  cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Cannot cancel payed course!')
  }

  checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('Cannot check payment for payed course!')
  }

  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    throw new Error('Cannot pay again for payed course!')
  }
}

export class BuyCourseSagaStateCanceled extends BuyCourseSageState {
  cancel(): Promise<{ user: UserEntity }> {
    throw new Error('Cannot cancel payment for payment cancelled course!')
  }

  checkPayment(): Promise<{ user: UserEntity; status: PaymentStatus }> {
    throw new Error('Cannot check payment for payment cancelled course!')
  }

  pay(): Promise<{ paymentLink: string; user: UserEntity }> {
    this.saga.setState(PurchaseState.Started, this.saga.courseId)
    return this.saga.getState().pay()
  }
}
