import { Body, Controller, Logger } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AccountLogin, AccountRegister } from '@nest-microservices/contracts'
import { Message, RMQMessage, RMQRoute, RMQValidate } from 'nestjs-rmq'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RMQValidate()
  @RMQRoute(AccountRegister.topic)
  async register(
    dto: AccountRegister.Request,
    @RMQMessage message: Message
  ): Promise<AccountRegister.Response> {
    const { requestId } = message.properties.headers
    const logger = new Logger(requestId)
    logger.error('some error')
    return this.authService.register(dto)
  }

  @RMQValidate()
  @RMQRoute(AccountLogin.topic)
  async login(@Body() dto: AccountLogin.Request): Promise<AccountLogin.Response> {
    const { id } = await this.authService.validateUser(dto.email, dto.password)
    return this.authService.login(id)
  }
}
