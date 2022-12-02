import { Controller, Get, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { UserId } from '../guards/user.decorator'

@Controller('user')
export class AuthController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('info')
  async getUser(@UserId() userId) {}
}
