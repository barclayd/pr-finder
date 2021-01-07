export interface GithubUser {
  profile: GithubUserProfile;
  accessToken: string;
}

interface GithubUserProfile {
  displayName: string;
  username: string;
  profileUrl: string;
  _json: {
    avatar_url: string;
    organizations_url: string;
  };
}
