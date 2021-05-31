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

export default class ContextService {
  private static getRepoOwnerData(context: HookContext): RepoOwnerData {
    return context.repo();
  }

  public static getIssueCommentCreator(context: HookContext): (comment: string) => void {
    return async (comment: string) =>
      await context.octokit.issues.createComment(
        context.issue({
          body: comment,
        })
      );
  }

  public static getLabelCreator(context: HookContext): (name: string, desc: string, color: string) => Promise<any> {
    return async (name: string, desc: string, color: string) =>
      await context.octokit.rest.issues.createLabel({
        ...ContextService.getRepoOwnerData(context),
        name: name,
        description: desc,
        color: color,
      });
  }

  public static getAuthorsIssuesRetriever(context: HookContext): (author: string) => Promise<GHIssue[] | undefined> {
    return async (author: string) => {
      const rest_result = await context.octokit.issues.listForRepo({
        ...ContextService.getRepoOwnerData(context),
        creator: author,
      });
      return rest_result.status === CODE_REST_REQUEST_SUCCESS ? rest_result.data as GHIssue[] : undefined;
    };
  }

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

  public static getPRLabelReplacer(
    context: HookContext
  ): (removalLabelName: string[], replacementLabelNames: string[]) => void {
    return async (removalLabelName: string[], replacementLabelNames: string[]) => {
      const repoOwnerData: RepoOwnerData = ContextService.getRepoOwnerData(context);
      for (const removalName of removalLabelName) {
        await context.octokit.rest.issues.removeLabel({
          ...repoOwnerData,
          issue_number: context.payload.pull_request?.number!,
          name: removalName,
        });
      }

      await context.octokit.rest.issues.addLabels({
        ...repoOwnerData,
        issue_number: context.payload.pull_request?.number!,
        labels: replacementLabelNames,
      });
    };
  }
}
