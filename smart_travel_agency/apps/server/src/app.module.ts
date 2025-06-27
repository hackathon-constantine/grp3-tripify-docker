import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@infrastructure/prisma/prisma.module';
import { CloudinaryModule } from '@infrastructure/cloudinary/cloudinary.module';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';

// Controllers
import { UserController } from '@application/controller/user.controller';
import { TripController } from '@application/controller/trip.controller';
import { ReservationController } from '@application/controller/reservation.controller';
import { AuthController } from '@application/controller/auth.controller';
import { HotelController } from '@application/controller/hotel.controller';
import { DestinationController } from '@application/controller/destination.controller';

// Services
import { UserService } from '@domain/services/User.service';
import { TripService } from '@domain/services/Trip.service';
import { ReservationService } from '@domain/services/reservation.service';
import { AuthService } from '@domain/services/auth.service';
import { HotelService } from '@domain/services/hotel.service';
import { DestinationService } from '@domain/services/destination.service';

// Repositories
import { UserRepository } from '@infrastructure/repository/user.repository';
import { TripRepository } from '@infrastructure/repository/TripRepository';
import { ReservationRepository } from '@infrastructure/repository/Reservation';
import { HotelRepository } from '@infrastructure/repository/hotel.repository';
import { DestinationRepository } from '@infrastructure/repository/destination.repository';

// Other
import { ResponseHandler } from '@application/interfaces/response';
import { AuthGuard } from '@application/guards/auth.guard';
import { RoleGuard } from '@application/guards/role.guard';
import { PaymentController } from '@application/controller/payment.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    CloudinaryModule,
  ],
  controllers: [
    UserController,
    TripController,
    ReservationController,
    AuthController,
    HotelController,
    DestinationController,
    PaymentController
  ],
  providers: [
    UserService,
    TripService,
    ReservationService,
    AuthService,
    HotelService,
    DestinationService,
    UserRepository,
    TripRepository,
    ReservationRepository,
    HotelRepository,
    DestinationRepository,
    ResponseHandler,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    Reflector,
  ],
})
export class AppModule {}
