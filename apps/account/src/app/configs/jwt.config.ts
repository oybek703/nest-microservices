import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModuleAsyncOptions } from '@nestjs/jwt'

export const getJwtConfig = (): JwtModuleAsyncOptions => {
  return {
    useFactory: (configService: ConfigService) => ({
      secret: configService.get('JWT_SECRET')
    }),
    imports: [ConfigModule],
    inject: [ConfigService]
  }
}
