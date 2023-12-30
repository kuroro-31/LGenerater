/*
|--------------------------------------------------------------------------
| Prisma関連の型定義
|--------------------------------------------------------------------------
*/
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}
