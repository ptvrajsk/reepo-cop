import Label, { LabelAction } from './model_label';

export enum LabelCollectionType {
  IssueCollection = 'issue',
  PRCollection = 'pr',
}

export default class LabelCollection {
  private _collectionType: LabelCollectionType;
  private _labels: Label[];

  constructor(collectionType: LabelCollectionType, labels: Label[]) {
    this._collectionType = collectionType;
    this._labels = this.getValidatedLabels(labels);
  }

  private getValidatedLabels(labels: Label[]): Label[] {
    const labelActionSet: Set<string> = new Set<string>();
    const verifiedLabels: Label[] = [];
    for (const label of labels) {
      if (labelActionSet.has(label.action)) {
        console.error(`${label.action} has been defined before.`);
      } else {
        labelActionSet.add(label.action);
        verifiedLabels.push(label);
      }
    }
    return verifiedLabels;
  }

  public get collectionType(): LabelCollectionType {
    return this._collectionType;
  }

  public getLabel(labelAction: LabelAction): Label | undefined {
    return this._labels.find((label: Label) => label.action === labelAction);
  }

  public get allLabels(): Label[] {
    return this._labels;
  }
}
