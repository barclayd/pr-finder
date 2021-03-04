import axios from 'axios';

export class NetworkService {
  constructor(private accessToken?: string) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  public async get<T>(
    URL: string,
  ): Promise<{ status: number; data: T | undefined }> {
    try {
      const data = await axios.get<T>(URL, {
        headers: this.headers,
      });
      return {
        status: data.status,
        data: data.data,
      };
    } catch (error) {
      console.log(`Error fetching URL: ${URL} with error: ${error}`);
      return {
        status: 500,
        data: undefined,
      };
    }
  }
}
