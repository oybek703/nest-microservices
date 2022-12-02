import { BadRequestException, Injectable } from '@nestjs/common'
import { UserRepository } from '../user/repositories/user.repository'
import { UserRole } from '@nest-microservices/interfaces'
import { UserEntity } from '../user/entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { AccountRegister } from '@nest-microservices/contracts'

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async register({ displayName, password, email }: AccountRegister.Request) {
    const oldUser = await this.userRepository.findUser(email)
    if (oldUser) {
      throw new BadRequestException('User with this email already exists!')
    }
    const newUserEntity = await new UserEntity({
      email,
      displayName,
      passwordHash: '',
      role: UserRole.Student
    }).setPassword(password)
    const newUser = await this.userRepository.createUser(newUserEntity)
    return { email: newUser.email }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findUser(email)
    if (!user) {
      throw new BadRequestException('Invalid credentials!')
    }
    const userEntity = new UserEntity(user)
    const matchPassword = await userEntity.validatePassword(password)
    if (!matchPassword) {
      throw new BadRequestException('Invalid credentials!')
    }
    return { id: user._id }
  }

  async login(id: string) {
    return {
      access_token: await this.jwtService.signAsync({ id })
    }
  }
}
