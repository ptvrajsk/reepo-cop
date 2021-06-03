/**
 * Enum exists as an accessible Identification
 * for each created label.
 * NOTE: Each LabelAction is unique and can only
 * be assigned once to a Label.
 */
 export enum PRType {
  ToReview = 'ToReview',
  ToMerge = 'ToMerge',
  OnGoing = 'OnGoing',
  Paused = 'OnHold',
}

export enum IssueType {
  Bug = 'Bug',
  WontFix = 'WontFix',
  Feature = 'Feature',
  Documentation = 'Doc',
  Enhancement = 'Enhancement',
}

export enum PriorityType {
  Urgent = 'Urgent',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
}

type LabelType = PRType | IssueType | PriorityType;
export default LabelType;