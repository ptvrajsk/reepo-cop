import { Context, WebhookPayloadWithRepository } from 'probot';
import GHIssue from '../model/model_ghIssue';

const CODE_REST_REQUEST_SUCCESS = 200;

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
  private static getRepoOwnerData(context: HookContext): RepoOwnerData {
    return context.repo();
  }

  /**
   * Returns an function that creates comments on a WebHook Issue.
   * NOTE: Issue Number is fetched from context object.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that adds a comment on an issue.
   */
  public static getIssueCommentCreator(context: HookContext): (comment: string) => void {
    return async (comment: string) =>
      await context.octokit.issues.createComment(
        context.issue({
          body: comment
        })
      );
  }

  /**
   * Returns a function that creates labels from specified
   * information.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that creates labels on Github.
   */
  public static getLabelCreator(context: HookContext): (name: string, desc: string, color: string) => Promise<any> {
    return async (name: string, desc: string, color: string) =>
      await context.octokit.rest.issues.createLabel({
        ...ContextService.getRepoOwnerData(context),
        name: name,
        description: desc,
        color: color,
      });
  }

  /**
   * Returns a function that fetches issues that are authored by
   * a specific user.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that retrieves author specific issues.
   */
  public static getAuthorsIssuesRetriever(context: HookContext): (author: string) => Promise<GHIssue[] | undefined> {
    return async (author: string) => {
      const rest_result = await context.octokit.issues.listForRepo({
        ...ContextService.getRepoOwnerData(context),
        creator: author,
      });
      return rest_result.status === CODE_REST_REQUEST_SUCCESS ? (rest_result.data as GHIssue[]) : undefined;
    };
  }

  /**
   * Returns a function that replaces a specified label's properties
   * with newly input data on Github.
   * @param context - Object returned from Probot's EventHook.
   * @returns an async function that updates labels on Github.
   */
  public static getLabelUpdater(
    context: HookContext
  ): (oldName: string, newName: string, desc: string, color: string) => Promise<any> {
    return async (oldName: string, newName: string, desc: string, color: string) =>
      await context.octokit.rest.issues.updateLabel({
        ...ContextService.getRepoOwnerData(context),
        name: oldName,
        new_name: newName,
        description: desc,
        color: color,
      });
  }

  /**
   * Returns a function that with relevant inputs,
   * removes specified labels from a Issue and replaces them
   * with a different set of specified labels.
   * @param context - Object returned from Probot's EventHook.
   * @param issueNumber - Number of Issue that is to have its labels replaced.
   * @returns an async function to replace labels on an issue.
   */
  public static getIssueLabelReplacer(
    context: HookContext,
    issueNumber?: number
  ): (removalLabelName: string[], replacementLabelNames: string[]) => void {
    return async (removalLabelName: string[], replacementLabelNames: string[]) => {
      const repoOwnerData: RepoOwnerData = ContextService.getRepoOwnerData(context);
      for (const removalName of removalLabelName) {
        await context.octokit.rest.issues.removeLabel({
          ...repoOwnerData,
          issue_number: issueNumber ? issueNumber : context.payload.issue?.number!,
          name: removalName,
        });
      }

      await context.octokit.rest.issues.addLabels({
        ...repoOwnerData,
        issue_number: issueNumber ? issueNumber : context.payload.issue?.number!,
        labels: replacementLabelNames,
      });
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
  public static getPRLabelReplacer(
    context: HookContext,
    pullRequestNumber?: number
  ): (removalLabelName: string[], replacementLabelNames: string[]) => void {
    return ContextService.getIssueLabelReplacer(context, pullRequestNumber ? pullRequestNumber : context.payload.pull_request?.number!);
  }
}
