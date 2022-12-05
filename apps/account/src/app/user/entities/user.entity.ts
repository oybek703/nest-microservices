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

  public getCourseState(courseId: string): PurchaseState {
    return (
      this.courses.find((course) => course.courseId === courseId)?.purchaseState ??
      PurchaseState.Started
    )
  }

  public setCourseState(courseId: string, state: PurchaseState) {
    const existingCourse = this.courses.find((course) => course.courseId === courseId)
    if (!existingCourse) {
      this.courses.push({ courseId, purchaseState: state })
      return this
    }
    if (state === PurchaseState.Cancelled) {
      this.courses = this.courses.filter((course) => course.courseId !== courseId)
      return this
    }
    this.courses = this.courses.map((course) => {
      if (course.courseId === courseId) {
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
