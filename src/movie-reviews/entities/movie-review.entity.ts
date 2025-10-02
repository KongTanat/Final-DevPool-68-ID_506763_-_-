import { Rating } from '@app/rating/entities/rating.entity';
import { User } from '@app/users/entities/user.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'movie_reviews' })
export class MovieReviews {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    year: string;

    @Column()
    description: string;

    @ManyToOne(() => Rating)
    @JoinColumn({ name: 'rating_id', referencedColumnName: 'id' })
    rating: Rating;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'username', referencedColumnName: 'username' })
    user: User;

    @Column({ type: 'float', default: 0 })
    avgScore: number;

    @Column({ type: 'int', default: 0 })
    scoreCount: number;
}

