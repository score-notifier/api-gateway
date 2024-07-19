import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { NATS_SERVICE } from '../config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { catchError } from 'rxjs';

@Controller('stats')
export class StatsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get('leagues/:leagueId/standings')
  async getLeagueStandings(@Param('leagueId', ParseUUIDPipe) leagueId: string) {
    return this.client.send('stats.league.standings', { leagueId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('teams/:teamId')
  async getTeamStats(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.client.send('stats.team', { teamId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }
}
