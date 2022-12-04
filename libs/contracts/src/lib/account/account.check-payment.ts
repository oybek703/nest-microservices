import { IsString } from 'class-validator'
import { PurchaseState } from '@nest-microservices/interfaces'

export namespace AccountCheckPayment {
  export const topic = 'account.buy-course.command'

  export class Request {
    @IsString()
    userId: string

    @IsString()
    courseId: string
  }

  export class Response {
    state: PurchaseState
  }
}
