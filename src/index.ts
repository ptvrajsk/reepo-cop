import { Probot } from 'probot';
import LabelService from './services/labelService';
import PRService from './services/prService';
import { PRAction } from './model/model_pr';
import GHLabel from './model/model_ghLabel';
import ContextService, { HookContext } from './services/contextService';

const labelService: LabelService = new LabelService();

export = (app: Probot) => {

  app.on(['pull_request.opened', 'pull_request.reopened', 'pull_request.ready_for_review'], async (context: HookContext) => {
    PRService.replaceExistingPRLabels(
      ContextService.getPRLabelReplacer(context),
      context?.payload?.pull_request?.labels,
      PRAction.READY_FOR_REVIEW
    );
  });

  /**
   * Unfortunately there isn't a pre-defined hook for
   * some PR actions (i.e. Convert to draft) so this callback
   * can be used to run processes for those actions.
   */
  app.on(['pull_request'], async (context: HookContext) => {
    // 'as string' is necessary to prevent type checking
    switch (context.payload.action as string) {
      case 'converted_to_draft':
        PRService.replaceExistingPRLabels(
          ContextService.getPRLabelReplacer(context),
          context?.payload?.pull_request?.labels,
          PRAction.CONVERTED_TO_DRAFT
        );
        break;
    }
  });

  app.on(['issues', 'pull_request', 'label'], async (context: HookContext) => {
    const octokitResponse = await context.octokit.issues.listLabelsForRepo(context.repo());

    const labelCreator: (name: string, desc: string, color: string) => Promise<any> =
      ContextService.getLabelCreator(context);
    const labelUpdater: (oldName: string, newName: string, desc: string, color: string) => Promise<any> =
      ContextService.getLabelUpdater(context);

    labelService.generateMissingLabels(
      labelService.updateLabels(octokitResponse.data as GHLabel[], labelUpdater),
      labelCreator
    );
  });

  app.on('issues.opened', async (context: HookContext) => {
    const issueComment = context.issue({
      body: 'Thanks for opening this issue!',
    });

    await context.octokit.issues.createComment(issueComment);
  });
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
