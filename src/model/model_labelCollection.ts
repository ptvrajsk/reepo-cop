import Label from './model_label';
import LabelType from './model_label_type';

export enum LabelCollectionType {
  IssueCollection = 'issue',
  PRCollection = 'pr',
  PriorityCollection = 'priority'
}

export default class LabelCollection {
  private _collectionType: LabelCollectionType;
  private _labels: Label[];

  constructor(collectionType: LabelCollectionType, labels: Label[]) {
    this._collectionType = collectionType;
    this._labels = this.getValidatedLabels(labels);
  }

  private getValidatedLabels(labels: Label[]): Label[] {
    const labelTypeSet: Set<string> = new Set<string>();
    const verifiedLabels: Label[] = [];
    
    for (const label of labels) {
      if (labelTypeSet.has(label.type)) {
        console.error(`${label.type} has been defined before.`);
      } else {
        labelTypeSet.add(label.type);
        verifiedLabels.push(label);
      }
    }
    
    return verifiedLabels;
  }

  public get collectionType(): LabelCollectionType {
    return this._collectionType;
  }

  public getLabel(labelType: LabelType): Label | undefined {
    return this._labels.find((label: Label) => label.type === labelType);
  }

  public get allLabels(): Label[] {
    return this._labels;
  }
}
