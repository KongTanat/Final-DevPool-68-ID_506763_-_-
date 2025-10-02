
import { User } from '@app/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm';
import { MovieReviews } from './movie-review.entity';


;
@Entity('scores')
@Unique(['user', 'movieReview']) // user can rate a recipe only once
export class Score {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', width: 1 })
  score: number;

  @ManyToOne(() => MovieReviews, { nullable: false })
  @JoinColumn({ name: 'movie_reviews_id', referencedColumnName: 'id' })
  movieReview: MovieReviews;


  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'username', referencedColumnName: 'username' })
  user: User;
}