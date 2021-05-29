import LabelArchive from '../model/model_labelArchive';
import Label, { LabelAction } from '../model/model_label';
import LabelCollection, { LabelCollectionType } from '../model/model_labelCollection';

export const LABEL_ARCHIVE: LabelArchive = new LabelArchive([
  new LabelCollection(LabelCollectionType.IssueCollection, [
    new Label(
      `🐞 ${LabelCollectionType.IssueCollection}.Bug`,
      'This issue describes a bug.',
      'D73A4A',
      'bug',
      LabelAction.Bug
    ),
    new Label(
      `⚙️ ${LabelCollectionType.IssueCollection}.Feature`,
      'This issue describes a new feature.',
      '120BB0',
      'feature',
      LabelAction.Feature
    ),
    new Label(
      `📈 ${LabelCollectionType.IssueCollection}.Enhancement`,
      'This issue describes an enhancement to an existing feature.',
      '19504B',
      'enhance',
      LabelAction.Enhancement
    ),
    new Label(
      `📚 ${LabelCollectionType.IssueCollection}.Documentation`,
      'This issue describes a change to the existing documentation.',
      '0075CA',
      'doc',
      LabelAction.Documentation
    ),
    new Label(
      `❌ ${LabelCollectionType.IssueCollection}.WontFix`,
      'This issue describes a suggestion that will not be fixed.',
      'FFFFFF',
      'wontfix',
      LabelAction.WontFix
    ),
  ]),
  new LabelCollection(LabelCollectionType.PRCollection, [
    new Label(
      `🏃 ${LabelCollectionType.PRCollection}.Ongoing`,
      'This PR is still in progress.',
      '2FEFDD',
      ['progress', 'ongoing'],
      LabelAction.OnGoing
    ),
    new Label(
      `👍 ${LabelCollectionType.PRCollection}.ToMerge`,
      'This PR is ready for merger.',
      '0E8A16',
      'merge',
      LabelAction.ToMerge
    ),
    new Label(
      `🔬 ${LabelCollectionType.PRCollection}.ToReview`,
      'This PR is ready for review.',
      'BA50EB',
      'review',
      LabelAction.ToReview
    ),
    new Label(
      `🛑 ${LabelCollectionType.PRCollection}.OnHold`,
      "This PR's progress is halted.",
      'C5DEF5',
      'hold',
      LabelAction.Paused
    ),
  ]),
]);
