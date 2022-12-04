import {
  IDomainEvent,
  IUser,
  IUserCourses,
  PurchaseState,
  UserRole
} from '@nest-microservices/interfaces'
import { compare, genSalt, hash } from 'bcryptjs'
import { AccountChangedCourse } from '@nest-microservices/contracts'

export class UserEntity implements IUser {
  _id: string
  displayName?: string
  email: string
  passwordHash: string
  role: UserRole
  courses?: IUserCourses[]
  events: IDomainEvent[] = []

  constructor(user: IUser) {
    this._id = user._id
    this.passwordHash = user.passwordHash
    this.displayName = user.displayName
    this.email = user.email
    this.role = user.role
    this.courses = user.courses
  }

  public setCourseState(courseId: string, state: PurchaseState) {
    const existingCourse = this.courses.find(({ _id }) => _id === courseId)
    if (!existingCourse) {
      this.courses.push({ courseId, purchaseState: PurchaseState.Started })
      return this
    }
    if (state === PurchaseState.Cancelled) {
      this.courses = this.courses.filter(({ _id }) => _id !== courseId)
      return this
    }
    this.courses = this.courses.map((course) => {
      if (course._id === courseId) {
        course.purchaseState = state
      }
      return course
    })
    this.events.push({
      topic: AccountChangedCourse.topic,
      data: { userId: this._id, courseId, state }
    })
    return this
  }

  public getPublicProfile() {
    return {
      email: this.email,
      role: this.role,
      displayName: this.displayName
    }
  }

  public async setPassword(password: string) {
    const salt = await genSalt(5)
    this.passwordHash = await hash(password, salt)
    return this
  }

  public async validatePassword(password: string) {
    return await compare(password, this.passwordHash)
  }

  public updateProfile(displayName: string) {
    this.displayName = displayName
    return this
  }
}
