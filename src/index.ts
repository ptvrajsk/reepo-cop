import { Probot } from 'probot';
import { PRAction } from './model/model_pr';
import { HookContext } from './services/contextService';
import BotService from './services/botService';

const _botService: BotService = new BotService();

export = (app: Probot) => {
  app.on(
    ['pull_request.opened', 'pull_request.reopened', 'pull_request.ready_for_review'],
    async (context: HookContext) => {
      await _botService.handlePRLabelReplacement(context, PRAction.READY_FOR_REVIEW);
    }
  );

  /**
   * Unfortunately there isn't a pre-defined hook for
   * some PR actions (i.e. Convert to draft) so this callback
   * can be used to run processes for those actions.
   */
  app.on(['pull_request'], async (context: HookContext) => {
    // 'as string' is necessary to prevent type checking.
    switch (context.payload.action as string) {
      case 'converted_to_draft':
        await _botService.handlePRLabelReplacement(context, PRAction.CONVERTED_TO_DRAFT);
        break;
    }
  });

  app.on('issues.opened', async (context: HookContext) => {
    await _botService.handleUserCongratulatoryMessage(context, 'Issue');
  });

  app.on(['issues.opened', 'issues.edited'], async (context: HookContext) => {
    await _botService.handleAutomatedIssueLabelling(context);
  });
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
