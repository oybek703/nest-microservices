export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student'
}

export interface IUser {
  _id?: string
  displayName?: string
  passwordHash: string
  email: string
  role: UserRole
}
