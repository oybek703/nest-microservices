import { Controller, Get, Logger, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { UserId } from '../guards/user.decorator'
import { Cron } from '@nestjs/schedule'

@Controller('user')
export class UserController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('info')
  async getUser(@UserId() userId) {}

  @Cron('*/5 * * * * *')
  async cron() {
    Logger.log(Date.now())
  }
}
