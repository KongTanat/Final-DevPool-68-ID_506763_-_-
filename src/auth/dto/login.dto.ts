import {z} from "zod"
import { createZodDto } from "nestjs-zod"

//zod ทำงานก่อนข้อมูลจะถูกนำไป bussiness logic
export const loginDtoSchema = z.object({
    username : z.string().min(3,"username is required"),
    password : z.string().min(3,"username is required"),

})

export class LoginDto extends createZodDto (loginDtoSchema){}
