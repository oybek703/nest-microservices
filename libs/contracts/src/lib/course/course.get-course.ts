import { IsString } from 'class-validator'
import { ICourse } from '@nest-microservices/interfaces'

export namespace CourseGetCourse {
  export const topic = 'course.get-course.query'

  export class Request {
    @IsString()
    courseId: string
  }

  export class Response {
    course: ICourse | null
  }
}
