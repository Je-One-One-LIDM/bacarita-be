import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Teacher } from 'src/feature/users/entities/teacher.entity';
import { Repository } from 'typeorm';
import {
  AUTH_REQUEST_USER_KEY,
  AuthDecorator,
  AuthRole,
} from '../enums/auth.enum';
import { ICurrentUser } from '../interfaces/current-user.interfaces';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: string[] = this.reflector.getAllAndOverride<string[]>(
      AuthDecorator.ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request: Request = context.switchToHttp().getRequest<Request>();

    const authHeader: string | undefined = request.headers.authorization;
    if (!authHeader) throw new UnauthorizedException();
    const token: string = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException();

    switch (roles) {
      case undefined:
        return true;
      case [AuthRole.ANY]:
        return true;
      case [AuthRole.TEACHER]: {
        const teacher: Teacher | null = await this.teacherRepository.findOneBy({
          token: token,
        });

        if (!teacher) throw new UnauthorizedException();

        const currentUser: ICurrentUser = {
          id: teacher.id,
          email: teacher.email,
          username: teacher.username,
          role: AuthRole.TEACHER,
        };
        request[AUTH_REQUEST_USER_KEY] = currentUser;
        return true;
      }
      default:
        return true;
    }

    return true;
  }
}
