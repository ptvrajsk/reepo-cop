import Label, { LabelAction } from './model_label';
import LabelCollection, { LabelCollectionType } from './model_labelCollection'

export default class LabelArchive {
  private _labelCollections: LabelCollection[];

  constructor(labelCollections: LabelCollection[]) {
    this._labelCollections = labelCollections;
  }

  public collatePresetSubstrings(): Map<string[], Label> {
    const presetSubstrMap: Map<string[], Label> = new Map();
    this._labelCollections.forEach((labelCollection: LabelCollection) => {
      labelCollection.allLabels.forEach((label: Label) => {
        presetSubstrMap.set(label.labelAlias, label);
      });
    });
    return presetSubstrMap;
  }

  public collatePresetLabels(): Label[] {
    return this._labelCollections.flatMap((labelCollection: LabelCollection) => {
      return labelCollection.allLabels;
    });
  }

  /**
   * Searches and returns a specified label.
   * @param labelCollectionType - Identifier for collection to search for label in.
   * @param labelAction - Identifier for label.
   * @returns Returns label that was found from identifiers.
   * @throws Error if label is not found.
   */
  public getLabel(labelCollectionType: LabelCollectionType, labelAction: LabelAction): Label | undefined {
    const foundLabel: Label | undefined = this._labelCollections
      .find((labelCollection: LabelCollection) => labelCollection.collectionType === labelCollectionType)
      ?.getLabel(labelAction);

    if (!foundLabel) {
      console.error(`No Label Error: Label -> ${labelAction} from collection ${labelCollectionType} does not exist.`);
    }

    return foundLabel;
  }
}