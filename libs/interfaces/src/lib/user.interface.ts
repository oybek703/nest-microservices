export enum UserRole {
  Teacher = 'Teacher',
  Student = 'Student'
}

export enum PurchaseState {
  Started = 'Started',
  WaitingForPayment = 'WaitingForPayment',
  Purchased = 'Purchased',
  Cancelled = 'Cancelled'
}

export interface IUser {
  _id?: string
  displayName?: string
  passwordHash: string
  email: string
  role: UserRole
  courses?: IUserCourses[]
}

export interface IUserCourses {
  _id?: string
  courseId: string
  purchaseState: PurchaseState
}
