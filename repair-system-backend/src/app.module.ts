import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Comment } from './entities/comment.entity';
import { RepairRequest } from './entities/repair-request.entity';
import { User } from './entities/user.entity';

// Modules
import { AuthModule } from './auth/auth.module';
import { RequestsModule } from './requests/requests.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'postgres',
      entities: [User, RepairRequest, Comment],
      synchronize: true, // ← АВТОМАТИЧЕСКИ СОЗДАЁТ ТАБЛИЦЫ
      logging: false,
      dropSchema: false, // ← НЕ УДАЛЯТЬ СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret_key_12345',
      signOptions: {
        expiresIn: '24h',
      },
    }),

    AuthModule,
    UsersModule,
    RequestsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
