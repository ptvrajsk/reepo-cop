import { LABEL_ARCHIVE } from '../constants/const_labels';
import GHIssue from '../model/model_ghIssue';
import GHUser from '../model/model_ghUser';
import Label from '../model/model_label';
import { LabelCollectionType } from '../model/model_labelCollection';
import LabelService from './labelService';

export default class IssueService {
  // Milestone Issue Counts - (When to congratulate the Issue Author)
  private static milestones: number[] = [1, 25, 50, 75, 100];

  /**
   * A function to get an appropriate postfix based on milestone count.
   * @param milestone - Number representing Issue Milestone Count.
   * @returns string that functions as a postfix to specified Milestone count.
   */
  private static getMilestonePostfix(milestone: number): string {
    switch (milestone) {
      case 1:
        return 'st';
      default:
        return 'th';
    }
  }

  /**
   * Attempts to fetch and return an array of GHIssues made by specified
   * author. Promise returns undefined if fetch failed.
   * @param ghUser - Author of issues on Github.
   * @param userIssuesRetriever - A function that retrieves issues by said user.
   * @returns an array of GHIssues or undefined if issue fetch failed.
   */
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

  /**
   * Checks if the number of issues made so far is a milestone number.
   * @param numberOfUsersIssues - Number of Issues made by users.
   * @returns true/false depending on whether the count of issues is a milestone count.
   */
  public static isUsersMilestoneIssue(numberOfUsersIssues: number): boolean {
    for (const milestone of this.milestones) {
      if (numberOfUsersIssues === milestone) {
        return true;
      }
    }

    return false;
  }

  /**
   * Crafts a congratulatory message for opening a number of issues for the user.
   * @param numberOfUsersIssues - Number of issues made by user.
   * @returns string containing the congratulation message.
   */
  public static getUserMilestoneIssueCongratulation(numberOfUsersIssues: number): string {
    return `Nice work opening your ${numberOfUsersIssues}${IssueService.getMilestonePostfix(
      numberOfUsersIssues
    )} issue! 😁🎊👍`;
  }

  /**
   * Checks if an issue needs to be automatically labelled based on a formatted title and
   * auto-assign labels if necessary.
   * @param ghIssue - GHIssue that could be automatically labelled.
   * @param labelReplacer - A function that replaces existing Issue Labels with newly specified ones.
   * @returns void
   */
  public static handleAutomatedLabelling(
    ghIssue: GHIssue,
    labelReplacer: (removalLabelName: string[], replacementLabelNames: string[]) => void
  ) {
    const presetLabels: Label[] = LABEL_ARCHIVE.collatePresetLabels();

    const autoIssueLabel: Label | undefined = presetLabels.find(
      (label: Label) =>
        label.name.includes(LabelCollectionType.IssueCollection) && ghIssue.title.toLowerCase().includes(`${label.type.toLowerCase()}:`)
    );

    const autoPriorityLabel: Label | undefined = presetLabels.find(
      (label: Label) =>
        label.name.includes(LabelCollectionType.PriorityCollection) &&
        ghIssue.title.toLowerCase().includes(`[${label.type.toLowerCase().substr(0, 1)}]`)
    );

    if (!autoIssueLabel && !autoPriorityLabel) {
      return;
    }

    const labelNamesToAdd: string[] = [];
    if (autoIssueLabel) {
      labelNamesToAdd.push(autoIssueLabel.name);
    }
    if (autoPriorityLabel) {
      labelNamesToAdd.push(autoPriorityLabel.name);
    }

    const labelNamesToRemove: string[] = [
      ...LabelService.extractLabelNames(LabelCollectionType.IssueCollection, ghIssue.labels),
      ...LabelService.extractLabelNames(LabelCollectionType.PriorityCollection, ghIssue.labels),
    ];

    labelReplacer(labelNamesToRemove, labelNamesToAdd);
  }
}
