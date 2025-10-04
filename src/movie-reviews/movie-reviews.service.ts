import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieReviewDto } from './dto/create-movie-review.dto';
import { UpdateMovieReviewDto } from './dto/update-movie-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MovieReviews } from './entities/movie-review.entity';
import { Repository } from 'typeorm';
import { LoggedInDto } from '@app/auth/dto/logged-in.dto';
import { PaginateQuery, PaginateConfig, paginate } from 'nestjs-paginate';

const paginateConfig: PaginateConfig<MovieReviews> = {
  sortableColumns: ['id', 'name', 'avgScore', 'scoreCount'],  //เรียงตามอะไร
  searchableColumns: ['name', 'rating' ,'year'], //ค้นหาจากอะไรได้บ้าง
};

@Injectable()
export class MovieReviewsService {
  constructor(@InjectRepository(MovieReviews) private repository: Repository<MovieReviews>,
  ) { }

  private queryTemplate() {  //เพื่อสะดวกในการใช้ข้อมูลใน database
    return this.repository
      .createQueryBuilder('movie_reviews')
      .leftJoinAndSelect('movie_reviews.rating', 'rating') //ดึงข้อมูล rating
      .leftJoin('movie_reviews.user', 'user') //เชื่อมกับตาราง user
      .addSelect('user.id') // เลือกมาเฉพาะที่ต้องการ
      .addSelect('user.username')
      .addSelect('user.role');
  }


  create(createMovieReviewDto: CreateMovieReviewDto, loggedInDto: LoggedInDto) {  //เพิ่มหนัง
    return this.repository.save({
      ...createMovieReviewDto,    //sprend เพิ่ม  username
      user: { username: loggedInDto.username }
    });
  }

  async search(query: PaginateQuery) {
    const page = await paginate<MovieReviews>(
      query, // ข้อมูลที่ผู้ใช้ส่งมา
      this.queryTemplate(),
      paginateConfig,  //ให้ทำอะไรได้บ้างจัดเรียง ค้นหา
    )
    return {
      data: page.data, //รายการที่ถูกแบ่งหน้าไว้แล้ว
      meta: page.meta  //จำนวนหน้ารวม/รายการทั้งหมด
    };
  }

  findOne(id: number) { // ค้นหาด้วย id
    return this.queryTemplate().where('movie_reviews.id = :id', { id }).getOne(); //นำค่า id ที่ได้รับจาก method  ไปหาใน movie_reviews.id 
  }

  async update(
    id: number,
    updateMovieReviewDto: UpdateMovieReviewDto,
    loggedInDto: LoggedInDto) {
    return this.repository
      .findOneByOrFail({ id, user: { username: loggedInDto.username } }) //ตรวจสอบและยืนยัน
      .then(() => this.repository.save({ id, ...updateMovieReviewDto })) //ส่ง id เข้าไปเพื่อเป็นการ update ไม่ใช่การสร้างใหม่
      .catch(() => {
        throw new NotFoundException(`Not found: id=${id}`) //เมื่อไม่เข้าเงื่อนไข
      })
  };

  async remove(id: number, loggedInDto: LoggedInDto) {
    return this.repository
      .findOneByOrFail({ id, user: { username: loggedInDto.username } })
      .then(() => this.repository.delete({ id }))  //ระบุ id ที่จะลบ
      .catch(() => {
        throw new NotFoundException(`Not found: id=${id}`);
      });
  }
}
