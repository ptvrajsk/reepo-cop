import { Context, WebhookPayloadWithRepository } from 'probot';
import GHIssue from '../model/model_ghIssue';
import GHLabel from '../model/model_ghLabel';
import GHUser from '../model/model_ghUser';

const CODE_REST_REQUEST_SUCCESS = 200;
const CODE_REST_POST_SUCCESS = 201;

/**
 * Meant to help abbreviate context object type.
 */
export interface HookContext extends Context<WebhookPayloadWithRepository> {}

interface RepoOwnerData {
  owner: string;
  repo: string;
}

/**
 * A Service that helps manipulate HookContext objects on Runtime
 * to get relevant data / functions that can perform actions using
 * HookContext.
 */
export default class ContextService {
  /**
   * Returns an object that contains owner and repo information.
   * @param context - Object returned from Probot's EventHook.
   * @returns object containing owner and repository information.
   */
  private getRepoOwnerData(context: HookContext): RepoOwnerData {
    return context.repo();
  }

  /**
   * Returns an function that creates comments on a WebHook Issue.
   * NOTE: Issue Number is fetched from context object.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that adds a comment on an issue.
   */
  public getIssueCommentCreator(context: HookContext): (comment: string) => Promise<boolean> {
    return async (comment: string) =>
      (
        await context.octokit.issues.createComment(
          context.issue({
            body: comment,
          })
        )
      ).status === CODE_REST_POST_SUCCESS;
  }

  /**
   * Returns a function that can fetch all labels for given repo.
   * NOTE: Repo data is fetched from context.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that fetches Labels from Github.
   */
  public getRepoLabelsRetriever(context: HookContext): () => Promise<GHLabel[]> {
    return async () =>
      (await context.octokit.issues.listLabelsForRepo({ ...this.getRepoOwnerData(context) })).data as GHLabel[];
  }

  /**
   * Returns a function that creates labels from specified
   * information.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that creates labels on Github which
   * promises true if label creation is successful.
   */
  public getLabelCreator(context: HookContext): (name: string, desc: string, color: string) => Promise<boolean> {
    return async (name: string, desc: string, color: string) =>
      (
        await context.octokit.rest.issues.createLabel({
          ...this.getRepoOwnerData(context),
          name: name,
          description: desc,
          color: color,
        })
      ).status === CODE_REST_POST_SUCCESS;
  }

  /**
   * Returns a function that fetches issues that are authored by
   * a specific user.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that retrieves author specific issues.
   */
  public getAuthorsIssuesRetriever(context: HookContext): (author: string) => Promise<GHIssue[] | undefined> {
    return async (author: string) => {
      const rest_result = await context.octokit.issues.listForRepo({
        ...this.getRepoOwnerData(context),
        creator: author,
      });
      return rest_result.status === CODE_REST_REQUEST_SUCCESS ? (rest_result.data as GHIssue[]) : undefined;
    };
  }

  /**
   * Returns a function that replaces a specified label's properties
   * with newly input data on Github.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that updates labels on Github and promises true
   * if update was a success.
   */
  public getLabelUpdater(
    context: HookContext
  ): (oldName: string, newName: string, desc: string, color: string) => Promise<boolean> {
    return async (oldName: string, newName: string, desc: string, color: string) =>
      (
        await context.octokit.rest.issues.updateLabel({
          ...this.getRepoOwnerData(context),
          name: oldName,
          new_name: newName,
          description: desc,
          color: color,
        })
      ).status === CODE_REST_REQUEST_SUCCESS;
  }

  /**
   * Returns a function that with relevant inputs,
   * removes specified labels from a Issue and replaces them
   * with a different set of specified labels.
   * @param context - Object returned from Probot's EventHook.
   * @param issueNumber - Number of Issue that is to have its labels replaced.
   * @returns an async function to replace labels on an issue.
   */
  public getIssueLabelReplacer(
    context: HookContext,
    issueNumber?: number
  ): (removalLabelName: string[], replacementLabelNames: string[]) => Promise<boolean> {
    return async (removalLabelName: string[], replacementLabelNames: string[]) => {
      const repoOwnerData: RepoOwnerData = this.getRepoOwnerData(context);
      const labelRemovalResults: boolean[] = [true];

      for (const removalName of removalLabelName) {
        const removalResult: boolean =
          (
            await context.octokit.rest.issues.removeLabel({
              ...repoOwnerData,
              issue_number: issueNumber ? issueNumber : context.payload.issue?.number!,
              name: removalName,
            })
          ).status === CODE_REST_REQUEST_SUCCESS;

        if (!removalResult) {
          console.log(`Error in removing Label: ${removalName} from Issue: ${issueNumber}`);
        }

        labelRemovalResults.push(removalResult);
      }

      const labelAdditionResult: boolean =
        replacementLabelNames && replacementLabelNames.length
          ? (
              await context.octokit.rest.issues.addLabels({
                ...repoOwnerData,
                issue_number: issueNumber ? issueNumber : context.payload.issue?.number!,
                labels: replacementLabelNames,
              })
            ).status === CODE_REST_REQUEST_SUCCESS
          : true;

      if (!labelAdditionResult) {
        console.log(`Error in adding labels to Issue: ${issueNumber}`);
      }

      return (
        labelRemovalResults.reduce((previousValue: boolean, currentValue: boolean) => previousValue && currentValue) &&
        labelAdditionResult
      );
    };
  }

  /**
   * Returns a function that with relevant inputs,
   * removes specified labels from a PR and replaces them
   * with a different set of specified labels.
   * @param context - Object returned from Probot's EventHook.
   * @param pullRequestNumber - Number of PR that is to have its labels replaced.
   * @returns an async function to replace labels on an issue.
   */
  public getPRLabelReplacer(
    context: HookContext,
    pullRequestNumber?: number
  ): (removalLabelName: string[], replacementLabelNames: string[]) => Promise<boolean> {
    // According to Github, for this case Issues and PRs are treated the same.
    return this.getIssueLabelReplacer(
      context,
      pullRequestNumber ? pullRequestNumber : context.payload.pull_request?.number!
    );
  }

  /**
   * Retrieves labels from context PR.
   * @param context - Object returned from Probot's EventHook.
   * @returns GHLabel[] containing all labels on context specified PR.
   */
  public extractLabelsFromPRHook(context: HookContext): GHLabel[] {
    return context.payload.pull_request?.labels;
  }

  /**
   * Retrieves issue bound to context.
   * @param context - Object returned from Probot's EventHook.
   * @returns GHIssue from context.
   */
  public extractIssueFromHook(context: HookContext): GHIssue {
    return context.payload.issue as GHIssue;
  }

  /**
   * Retrieves the Author of the Issue in context.
   * @param context - Object returned from Probot's EventHook.
   * @returns GHUser author of Issue in context.
   */
  public extractUserFromIssueHook(context: HookContext): GHUser {
    return this.extractIssueFromHook(context)?.user;
  }
}
