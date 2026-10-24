/**
 * @file apps/api/src/auth/auth.module.ts
 * @description NestJS module bundling authentication and KYB onboarding services.
 */

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
