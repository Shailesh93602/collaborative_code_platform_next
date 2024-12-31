export interface UserProfileProps {
  readonly user: typeof sessionStorage.user;
  readonly isOwnProfile: boolean;
  readonly dictionary: any;
}
