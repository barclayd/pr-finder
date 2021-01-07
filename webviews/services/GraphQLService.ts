import { GraphQLClient } from 'graphql-request';

export class GraphQLService {
  private API_URL = 'https://api.github.com/graphql';
  public readonly client: GraphQLClient;

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
