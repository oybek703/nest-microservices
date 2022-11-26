import { Document } from 'mongoose'
import { IUser, UserRole } from '@nest-microservices/interfaces'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class User extends Document implements IUser {
  @Prop()
  displayName?: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ required: true, enum: UserRole, type: String, default: UserRole.Student })
  role: UserRole
}

export const userSchema = SchemaFactory.createForClass(User)
