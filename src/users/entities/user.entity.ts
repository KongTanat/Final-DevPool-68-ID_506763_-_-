import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        unique: true,  // ใน column ห้ามซ้ำกัน
        nullable: false  // ต้องมีการใส่ค่าเสมอ
    })
    username: string;

    @Column({
        nullable: true  //กรณีไมจำ password ไม่เปลี่ยน database ไม่สร้าง
    })
    password: string;

    @Column({
        nullable: false,
        default: Role.USER
    })

    role: Role


    @Column({ name: 'keycloak_id', unique: true, nullable: true })
    keycloakId: string;
}
