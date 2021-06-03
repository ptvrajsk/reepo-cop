import LabelArchive from '../model/model_labelArchive';
import Label from '../model/model_label';
import { PRType, PriorityType, IssueType } from '../model/model_label_type';
import LabelCollection, { LabelCollectionType } from '../model/model_labelCollection';

export const LABEL_ARCHIVE: LabelArchive = new LabelArchive([
  new LabelCollection(LabelCollectionType.IssueCollection, [
    new Label(
      `🐞 ${LabelCollectionType.IssueCollection}.${IssueType.Bug}`,
      'This issue describes a bug.',
      'AA5117',
      'bug',
      IssueType.Bug
    ),
    new Label(
      `⚙️ ${LabelCollectionType.IssueCollection}.${IssueType.Feature}`,
      'This issue describes a new feature.',
      '120BB0',
      'feature',
      IssueType.Feature
    ),
    new Label(
      `📈 ${LabelCollectionType.IssueCollection}.${IssueType.Enhancement}`,
      'This issue describes an enhancement to an existing feature.',
      '19504B',
      'enhance',
      IssueType.Enhancement
    ),
    new Label(
      `📚 ${LabelCollectionType.IssueCollection}.${IssueType.Documentation}`,
      'This issue describes a change to the existing documentation.',
      '0075CA',
      'doc',
      IssueType.Documentation
    ),
    new Label(
      `❌ ${LabelCollectionType.IssueCollection}.${IssueType.WontFix}`,
      'This issue describes a suggestion that will not be fixed.',
      'FFFFFF',
      'wontfix',
      IssueType.WontFix
    )
  ]),
  new LabelCollection(LabelCollectionType.PRCollection, [
    new Label(
      `🏃 ${LabelCollectionType.PRCollection}.${PRType.OnGoing}`,
      'This PR is still in progress.',
      '2FEFDD',
      ['progress', 'ongoing'],
      PRType.OnGoing
    ),
    new Label(
      `👍 ${LabelCollectionType.PRCollection}.${PRType.ToMerge}`,
      'This PR is ready for merger.',
      '0E8A16',
      'merge',
      PRType.ToMerge
    ),
    new Label(
      `🔬 ${LabelCollectionType.PRCollection}.${PRType.ToReview}`,
      'This PR is ready for review.',
      'BA50EB',
      'review',
      PRType.ToReview
    ),
    new Label(
      `🛑 ${LabelCollectionType.PRCollection}.${PRType.Paused}`,
      "This PR's progress is halted.",
      'C5DEF5',
      'hold',
      PRType.Paused
    )
  ]),
  new LabelCollection(LabelCollectionType.PriorityCollection, [
    new Label(
      `🔥 ${LabelCollectionType.PriorityCollection}.${PriorityType.Urgent}`,
      'This must be completed immediately.',
      '3A0002',
      PriorityType.Urgent.toLowerCase(),
      PriorityType.Urgent
    ),
    new Label(
      `🚨 ${LabelCollectionType.PriorityCollection}.${PriorityType.High}`,
      'This should be worked on ASAP.',
      '6F0004',
      PriorityType.High.toLowerCase(),
      PriorityType.High
    ),
    new Label(
      `⏲️ ${LabelCollectionType.PriorityCollection}.${PriorityType.Medium}`,
      'This should be tackled when possible.',
      'AD0007',
      PriorityType.Medium.toLowerCase(),
      PriorityType.Medium
    ),
    new Label(
      `📭 ${LabelCollectionType.PriorityCollection}.${PriorityType.Low}`,
      "This can be completed after existing backlog of higher priority items.",
      'FE000A',
      PriorityType.Low.toLowerCase(),
      PriorityType.Low
    )
  ])
]);
