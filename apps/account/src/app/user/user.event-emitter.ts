import { Injectable } from '@nestjs/common'
import { UserEntity } from './entities/user.entity'
import { RMQService } from 'nestjs-rmq'

@Injectable()
export class UserEventEmitter {
  constructor(private readonly rmqService: RMQService) {}

  async handle({ events }: UserEntity) {
    for (const event of events) {
      await this.rmqService.notify(event.topic, event.data)
    }
  }
}
