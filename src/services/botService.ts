import LabelService from './labelService';
import PRService from './prService';
import ContextService, { HookContext } from './contextService';
import IssueService from './issueService';
import { PRAction } from '../model/model_pr';

export default class BotService {
  private _labelService: LabelService;
  private _prService: PRService;
  private _contextService: ContextService;
  private _issueService: IssueService;

  constructor() {
    this._labelService = new LabelService();
    this._prService = new PRService();
    this._contextService = new ContextService();
    this._issueService = new IssueService();
  }

  /**
   * Replaces existing PR Label with new ones depending on the type of action
   * taking place on said PR.
   * @param context - Context Object provided by Probot.
   * @param prAction - PR's Condition (What action to PR triggered this hook.)
   * @returns promise of true if label replacement was successful, false otherwise.
   */
  public async handlePRLabelReplacement(context: HookContext, prAction: PRAction): Promise<boolean> {
    if (!(await this.handleLabelValidation(context))) {
      console.log(this.generateLabelValidationFaliureMessage(`PRLabelReplacement: ${prAction}`));
    }

    return this._prService.replaceExistingPRLabels(
      this._contextService.getPRLabelReplacer(context),
      this._contextService.extractLabelsFromPRHook(context),
      PRAction.READY_FOR_REVIEW
    );
  }

  /**
   * Crafts and posts a comment of congratulation to a user for achieving a milestone
   * number of items.
   * @param context - Context Object provided by Probot.
   * @param congratulationType - string to check item for congratulation (i.e. PR/Issue).
   * @returns promise of true if message was successfully posted, false otherwise.
   */
  public async handleUserCongratulatoryMessage(
    context: HookContext,
    congratulationType: 'Issue' | 'PR'
  ): Promise<boolean> {
    switch (congratulationType) {
      case 'Issue':
        const userIssueCount: number = await this._issueService.getNumberOfIssuesCreatedByUser(
          this._contextService.extractUserFromIssueHook(context),
          this._contextService.getAuthorsIssuesRetriever(context)
        );
        if (this._issueService.isUsersMilestone(userIssueCount)) {
          const congPostResult: boolean = await this._contextService.getIssueCommentCreator(context)(
            this._issueService.getUserMilestoneIssueCongratulation(userIssueCount)
          );
          if (!congPostResult) {
            console.log('Unable to Post Congratulatory comment on Issue.');
          }
          return congPostResult;
        }
        break;

      case 'PR':
        console.log('PR Congratulation Function - Work In Progress');
        return false;
      default:
        return false;
    }

    return false;
  }

  /**
   * Attempts to auto-label an issue based on keywords present on its title. Performs
   * a label validation on the repo prior to auto-labelling.
   * @param context - Context Object provided by Probot.
   * @returns a promise of true if automated labelling was a success, false otherwise.
   */
  public async handleAutomatedIssueLabelling(context: HookContext): Promise<boolean> {
    if (!(await this.handleLabelValidation(context))) {
      console.log(this.generateLabelValidationFaliureMessage(`AutoIssueLabelling`));
    }

    if (!await this._issueService.performAutomatedLabelling(
      this._contextService.extractIssueFromHook(context),
      this._contextService.getIssueLabelReplacer(context)
    )) {
      console.log('Automated Issue Lablling has encountered an error.');
      return false;
    }

    return true;
  }

  /**
   * Ensures that all labels are validated prior to any Bot-Actions
   * involving labels.
   * @param context - Context Object provided by Probot.
   * @returns A promise of true if label validation was successful and
   * false otherwise.
   */
  private async handleLabelValidation(context: HookContext): Promise<boolean> {
    return await this._labelService.validateLabelsOnGihtub(
      this._contextService.getRepoLabelsRetriever(context),
      this._contextService.getLabelUpdater(context),
      this._contextService.getLabelCreator(context)
    );
  }

  /**
   * Generates a string based on the location of faliure while
   * using label validation.
   * @param location - string representing faliure location.
   * @returns a string that communicates a faliure in the label
   * validation step.
   */
  private generateLabelValidationFaliureMessage(location: string) {
    return `Label Validation failed in ${location}. Proceed with caution.`;
  }
}
