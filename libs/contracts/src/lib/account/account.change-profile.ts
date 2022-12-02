import { IsString } from 'class-validator'
import { IUser } from '@nest-microservices/interfaces'

export namespace AccountChangeProfile {
  export const topic = 'account.change-profile.command'

  export class Request {
    @IsString()
    user: Pick<IUser, 'displayName'>
    id: string
  }

  export class Response {}
}
