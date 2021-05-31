import GHIssue from '../model/model_ghIssue';
import GHUser from '../model/model_ghUser';

export default class IssueService {
  private static milestones: number[] = [1, 25, 50, 75, 100];

  private static getMilestonePostfix(milestone: number): string {
    switch (milestone) {
      case 1:
        return 'st';
      default:
        return 'th';
    }
  }

  public static async getNumberOfIssuesCreatedByUser(
    ghUser: GHUser,
    userIssuesRetriever: (author: string) => Promise<GHIssue[] | undefined>
  ): Promise<number> {
    const usersIssues: GHIssue[] | undefined = await userIssuesRetriever(ghUser.login);
    if (!usersIssues) {
      throw new Error(`Unable to retrieve issues made by user ${ghUser.login}`);
    }

    return usersIssues.length;
  }

  public static isUsersMilestoneIssue(numberOfUsersIssues: number): boolean {
    for (const milestone of this.milestones) {
      if (numberOfUsersIssues === milestone) {
        return true;
      }
    }

    return false;
  }

  public static getUserMilestoneIssueCongratulation(numberOfUsersIssues: number): string {
    return `Nice work opening your ${numberOfUsersIssues}${IssueService.getMilestonePostfix(
      numberOfUsersIssues
    )} issue! 😁🎊👍`;
  }
}
