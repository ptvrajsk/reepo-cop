import { Context, WebhookPayloadWithRepository } from 'probot';

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

  public static getLabelCreator(context: HookContext): (name: string, desc: string, color: string) => Promise<any> {
    return async (name: string, desc: string, color: string) =>
      await context.octokit.rest.issues.createLabel({
        ...ContextService.getRepoOwnerData(context),
        name: name,
        description: desc,
        color: color,
      });
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
