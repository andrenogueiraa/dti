import { User } from "better-auth/types";

export interface UserDevTeam {
  devTeamId: string;
  devTeamName: string | null;
  devTeamDescription: string | null;
  devTeamImageUrl: string | null;
  roleId: string;
  roleName: string | null;
  roleDescription: string | null;
  joinedAt: Date | null;
}

export interface ExtendedUser extends User {
  devTeams: UserDevTeam[];
}

export interface ExtendedSession {
  user: ExtendedUser;
  token: string;
  expiresAt: Date;
}
