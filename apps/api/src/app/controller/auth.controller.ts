import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { AccountLogin, AccountRegister } from '@nest-microservices/contracts'

@Controller('auth')
export class AuthController {
  constructor() {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: AccountRegister.Request) {}

  @Post('login')
  async login(@Body() dto: AccountLogin.Request) {}
}
