export interface RegisterTokenResponse {
  success: boolean;
  message: string;
  topicsSubscribed: string[];
  userId: string;
}

export interface UserGroupInfo {
  id: string;
  name: string;
}
