import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  /** Apagado ordenado: cierra las conexiones al recibir SIGTERM (despliegues en Railway). */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
