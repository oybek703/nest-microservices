import { InjectModel } from '@nestjs/mongoose'
import { User } from '../models/user.model'
import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { UserEntity } from '../entities/user.entity'

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async createUser(user: UserEntity) {
    const newUser = new this.userModel(user)
    return newUser.save()
  }

  async findUser(email: string) {
    return this.userModel.findOne({ email }).exec()
  }

  async updateUser({ _id, ...rest }: UserEntity) {
    return this.userModel.updateOne({ _id }, { $set: { ...rest } }).exec()
  }

  async findUserById(id: string) {
    return this.userModel.findById(id).select(['-passwordHash']).exec()
  }

  async deleteUser(email: string) {
    return this.userModel.deleteOne({ email })
  }

  async healthCheck() {
    return this.userModel.findOne({}).exec()
  }
}
