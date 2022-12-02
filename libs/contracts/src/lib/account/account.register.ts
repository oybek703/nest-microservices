import { IsEmail, IsOptional, IsString } from 'class-validator'

export namespace AccountRegister {
  export const topic = 'account.register.command'

  export class Request {
    @IsEmail()
    email: string

    @IsString()
    password: string

    @IsOptional()
    @IsEmail()
    displayName?: string
  }

  export class Response {
    email: string
  }
}
