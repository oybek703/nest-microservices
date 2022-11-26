import { Body, Controller, Post } from '@nestjs/common'
import { AuthDto } from './dto/auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: AuthDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: AuthDto) {
    const { id } = await this.authService.validateUser(dto.email, dto.password)
    return this.authService.login(id)
  }
}
