import { Controller, Inject, Get, Param, ParseUUIDPipe } from '@nestjs/common';

import { NATS_SERVICE } from 'src/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import { catchError } from 'rxjs';

@Controller('competitions')
export class CompetitionsController {
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  @Get('leagues')
  getLeagues() {
    return this.client.send('competitions.get.leagues', {}).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('leagues/:leagueId/teams')
  async getTeams(@Param('leagueId', ParseUUIDPipe) leagueId: string) {
    return this.client.send('competitions.leagues', { leagueId }).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @Get('leagues/:leagueId/teams/:teamId/matches')
  async getMatches(
    @Param('leagueId') leagueId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.client
      .send('competitions.leagues.matches', { leagueId, teamId })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }

  @Get('leagues/:leagueId/teams/:teamId/upcoming-matches')
  async getUpcomingMatches(
    @Param('leagueId') leagueId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.client
      .send('competitions.leagues.upcoming.matches', { leagueId, teamId })
      .pipe(
        catchError((error) => {
          throw new RpcException(error);
        }),
      );
  }
}
