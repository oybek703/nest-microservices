import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AccountLogin, AccountRegister } from '@nest-microservices/contracts'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: AccountRegister.Request): Promise<AccountRegister.Response> {
    return this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: AccountLogin.Request): Promise<AccountLogin.Response> {
    const { id } = await this.authService.validateUser(dto.email, dto.password)
    return this.authService.login(id)
  }
}
