import GHLabel from './model_ghLabel';
import Label from './model_label';
import LabelCollection, { LabelCollectionType } from './model_labelCollection';
import LabelType from './model_label_type';

export default class LabelArchive {
  private _labelCollections: LabelCollection[];

  constructor(labelCollections: LabelCollection[]) {
    this._labelCollections = labelCollections;
  }

  public collatePresetSubstringMap(): Map<string[], Label> {
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
  public getLabel(labelCollectionType: LabelCollectionType, labelType: LabelType): Label | undefined {
    const foundLabel: Label | undefined = this._labelCollections
      .find((labelCollection: LabelCollection) => labelCollection.collectionType === labelCollectionType)
      ?.getLabel(labelType);

    if (!foundLabel) {
      console.error(`No Label Error: Label -> ${labelType} from collection ${labelCollectionType} does not exist.`);
    }

    return foundLabel;
  }

  private findGHLabel(ghLabel: GHLabel): Label | undefined {
    return this.collatePresetLabels().find(
      (label: Label) => label.name === ghLabel.name && label.color === ghLabel.color && label.desc === ghLabel.color
    );
  }

  public mapGHLabels(ghLabels: GHLabel[]): Label[] {
    return ghLabels.map((ghLabel: GHLabel) => this.findGHLabel(ghLabel)).filter(Boolean) as Label[];
  }
}
