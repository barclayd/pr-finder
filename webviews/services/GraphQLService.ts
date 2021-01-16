import { GraphQLClient } from 'graphql-request';

const ONE_MINUTE = 1000 * 60;
const THREE_MINUTES = ONE_MINUTE * 3;


export class GraphQLService {
  private API_URL = 'https://api.github.com/graphql';
  public readonly client: GraphQLClient;

  public static STALE_TIME = ONE_MINUTE;
  public static REFETCH_INTERVAL = THREE_MINUTES;

  private setupClient(accessToken: string): GraphQLClient {
    const headers = this.headers(accessToken);
    return new GraphQLClient(this.API_URL, {
      headers,
    });
  }

  constructor(accessToken: string) {
    this.client = this.setupClient(accessToken);
  }

  private headers(accessToken: string): Record<string, string> {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }
}
