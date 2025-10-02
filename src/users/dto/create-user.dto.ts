import {z} from "zod"
import { Role } from "../entities/user.entity"
import { createZodDto } from "nestjs-zod"

//zod ทำงานก่อนข้อมูลจะถูกนำไป bussiness logic
export const createUserSchema = z.object({
    username : z.string().min(3,"username is required"),
    password : z.string().min(3,"username is required"),
    role: z.enum( Role,"role should be USER or ADMIN")
})


export class CreateUserDto extends createZodDto (createUserSchema){}
