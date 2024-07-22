import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ClientProxy } from '@nestjs/microservices';
import { NATS_SERVICE } from '../src/config';
import { of } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

describe('API Gateway Controllers (e2e)', () => {
  let app: INestApplication;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    clientProxy = moduleFixture.get<ClientProxy>(NATS_SERVICE);

    // For simplicity, we mock the client proxy send method and only positive tests.
    // Negative tests should be added to test the error handling in the controllers.
    //
    // If I want to test the actual communication with the microservices
    // I will need to have all the microservices running in the background, probably
    // already deployed in a cloud provider and run the e2e tests against them
    // with CI/CD pipelines.
    jest
      .spyOn(clientProxy, 'send')
      .mockImplementation((pattern: string, data: any) => {
        switch (pattern) {
          case 'user.register.profile':
            return of({ id: uuidv4(), ...data });
          case 'user.subscribe.team':
            return of({
              userId: data.userId,
              teamId: data.teamId,
              leagueId: data.leagueId,
            });
          case 'user.get.subscriptions':
            return of([
              {
                userId: 'test-user-uuid',
                teamId: 'test-team-uuid',
                leagueId: 'test-league-uui',
              },
            ]);
          case 'notification.get.all':
            return of([
              {
                id: uuidv4(),
                createdAt: new Date(),
                userId: data.userId,
                teamId: 'test-team-uuid',
                leagueId: 'test-league-uuid',
                message: 'Goal scored!',
                sent: false,
                eventType: "62' Goal: Manchester United - Cristiano Ronaldo",
                matchLiveScoreURL: 'https://live-score-url.com',
                subscriptionId: 'test-subscription-uuid',
              },
            ]);
          case 'competitions.get.leagues':
            return of([
              {
                id: uuidv4(),
                name: 'Premier League',
              },
            ]);
          case 'competitions.leagues':
            return of([
              {
                id: uuidv4(),
                name: 'Manchester United',
              },
            ]);
          case 'competitions.leagues.matches':
            return of([
              {
                id: uuidv4(),
                date: new Date(),
                homeTeam: 'Manchester United',
                awayTeam: 'Chelsea',
                score: '2-1',
              },
            ]);
          case 'competitions.leagues.upcoming.matches':
            return of([
              {
                id: uuidv4(),
                date: new Date(),
                homeTeam: 'Manchester United',
                awayTeam: 'Liverpool',
                score: null,
              },
            ]);
          case 'stats.league.standings':
            return of([
              {
                teamId: uuidv4(),
                teamName: 'Manchester United',
                position: 1,
                points: 86,
              },
            ]);
          case 'stats.team':
            return of({
              teamId: uuidv4(),
              teamName: 'Manchester United',
              wins: 26,
              draws: 8,
              losses: 4,
              goalsFor: 68,
              goalsAgainst: 24,
            });
          default:
            return of(null);
        }
      });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should perform the health check', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('API Gateway is up and running');
  });

  it('should subscribe a user to a team and league and receive notifications', async () => {
    const userProfile = {
      name: 'Testing User',
      email: 'testing@user.com',
      address: 'Testing User Address',
      id: uuidv4(),
    };

    await request(app.getHttpServer())
      .post('/users/register')
      .send(userProfile)
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toBeDefined();
        expect(body.email).toBe(userProfile.email);
      });

    const subscription = {
      userId: userProfile.id,
      teamId: uuidv4(),
      leagueId: uuidv4(),
    };

    await request(app.getHttpServer())
      .post('/users/subscribe')
      .send(subscription)
      .expect(201)
      .expect(({ body }) => {
        expect(body.userId).toBe(subscription.userId);
        expect(body.teamId).toBe(subscription.teamId);
        expect(body.leagueId).toBe(subscription.leagueId);
      });

    await request(app.getHttpServer())
      .get(`/notifications/${userProfile.id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBe(1);
        expect(body[0].message).toContain('Goal scored!');
      });
  });

  it('should get all leagues', async () => {
    await request(app.getHttpServer())
      .get('/competitions/leagues')
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].name).toBe('Premier League');
      });
  });

  it('should get teams for a league', async () => {
    const leagueId = uuidv4();
    await request(app.getHttpServer())
      .get(`/competitions/leagues/${leagueId}/teams`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].name).toBe('Manchester United');
      });
  });

  it('should get matches for a team in a league', async () => {
    const leagueId = uuidv4();
    const teamId = uuidv4();
    await request(app.getHttpServer())
      .get(`/competitions/leagues/${leagueId}/teams/${teamId}/matches`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].homeTeam).toBe('Manchester United');
        expect(body[0].awayTeam).toBe('Chelsea');
      });
  });

  it('should get upcoming matches for a team in a league', async () => {
    const leagueId = uuidv4();
    const teamId = uuidv4();
    await request(app.getHttpServer())
      .get(`/competitions/leagues/${leagueId}/teams/${teamId}/upcoming-matches`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].homeTeam).toBe('Manchester United');
        expect(body[0].awayTeam).toBe('Liverpool');
      });
  });

  // New tests for StatsController
  it('should get league standings', async () => {
    const leagueId = uuidv4();
    await request(app.getHttpServer())
      .get(`/stats/leagues/${leagueId}/standings`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.length).toBeGreaterThan(0);
        expect(body[0].teamName).toBe('Manchester United');
        expect(body[0].position).toBe(1);
        expect(body[0].points).toBe(86);
      });
  });

  it('should get team stats', async () => {
    const teamId = uuidv4();
    await request(app.getHttpServer())
      .get(`/stats/teams/${teamId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.teamName).toBe('Manchester United');
        expect(body.wins).toBe(26);
        expect(body.draws).toBe(8);
        expect(body.losses).toBe(4);
        expect(body.goalsFor).toBe(68);
        expect(body.goalsAgainst).toBe(24);
      });
  });
});
