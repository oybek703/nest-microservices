import { IUser, IUserCourses, PurchaseState, UserRole } from '@nest-microservices/interfaces'
import { compare, genSalt, hash } from 'bcryptjs'
import { BadRequestException } from '@nestjs/common'

export class UserEntity implements IUser {
  _id: string
  displayName?: string
  email: string
  passwordHash: string
  role: UserRole
  courses?: IUserCourses[]

  constructor(user: IUser) {
    this._id = user._id
    this.passwordHash = user.passwordHash
    this.displayName = user.displayName
    this.email = user.email
    this.role = user.role
    this.courses = user.courses
  }

  public addCourse(courseId: string) {
    const existingCourse = this.courses.find(({ _id }) => _id === courseId)
    if (existingCourse) {
      throw new BadRequestException('Course already added!')
    }
    this.courses.push({ courseId, purchaseState: PurchaseState.Started })
  }

  public deleteCourse(courseId: string) {
    this.courses = this.courses.filter(({ _id }) => _id !== courseId)
  }

  public updateCourseState(courseId: string, state: PurchaseState) {
    this.courses = this.courses.map((course) => {
      if (course._id === courseId) {
        course.purchaseState = state
      }
      return course
    })
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
