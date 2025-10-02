import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";



@Entity('rating')
export class Rating {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name:string;
}
