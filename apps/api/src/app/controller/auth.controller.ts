import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { RegisterDto } from '../dtos/register.dto'
import { LoginDto } from '../dtos/login.dto'
import { RMQService } from 'nestjs-rmq'
import { AccountLogin, AccountRegister } from '@nest-microservices/contracts'

@Controller('auth')
export class AuthController {
  constructor(private readonly rmqService: RMQService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      return await this.rmqService.send<AccountRegister.Request, AccountRegister.Response>(
        AccountRegister.topic,
        dto
      )
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException('Bad request!')
      }
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.rmqService.send<AccountLogin.Request, AccountLogin.Response>(
        AccountLogin.topic,
        dto
      )
    } catch (e) {
      if (e instanceof Error) {
        throw new BadRequestException('Invalid credentials!')
      }
    }
  }
}
