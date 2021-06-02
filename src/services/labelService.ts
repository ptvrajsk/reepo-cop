import GHLabel from '../model/model_ghLabel';
import Label, { LabelAction } from '../model/model_label';
import { LabelCollectionType } from '../model/model_labelCollection';
import { PRAction } from '../model/model_pr';
import { LABEL_ARCHIVE } from '../constants/const_labels';

export default class LabelService {
  /**
   * Updates any existing labels that match the set of preset labels.
   * @param octokitLabelsFetchResponse - Label data fetched from Github
   * @param labelCreator - Callback function that allows for Label creation on Github.
   * @param labelUpdater - Callback function that allows for label updating on Github.
   * @returns List of updated Labels.
   */
  public updateLabels(
    octokitLabelsFetchResponse: GHLabel[],
    labelUpdater: (oldName: string, newName: string, desc: string, color: string) => Promise<any>
  ): Label[] {
    let remainingLabels: Label[] = LABEL_ARCHIVE.collatePresetLabels();

    const presetSubstrIdentifiers: Map<string[], Label> = LABEL_ARCHIVE.collatePresetSubstringMap();

    presetSubstrIdentifiers.forEach((label: Label, substrings: string[]) => {
      for (const substr of substrings) {
        let isMatched = false;

        for (const labelResponseIndex in octokitLabelsFetchResponse) {
          if (octokitLabelsFetchResponse[labelResponseIndex].name.toLowerCase().includes(substr)) {
            isMatched = true;

            if (!label.isEquivalentToGHLabel(octokitLabelsFetchResponse[labelResponseIndex])) {
              labelUpdater(octokitLabelsFetchResponse[labelResponseIndex].name, label.name, label.desc, label.color);
            }

            octokitLabelsFetchResponse.splice(+labelResponseIndex, 1);
            remainingLabels = remainingLabels.filter((labelFromAll: Label) => labelFromAll.name !== label.name);
            break;
          }
        }
        if (isMatched) {
          break;
        }
      }
    });

    return remainingLabels;
  }

  /**
   * Creates remaining missing labels on Github.
   * @param remainingLabels - Labels that are missing from Github.
   * @param labelCreator - Callback function that enables Label Creation.
   */
  public generateMissingLabels(
    remainingLabels: Label[],
    labelCreator: (name: string, desc: string, color: string) => Promise<any>
  ): void {
    remainingLabels.forEach(
      async (label: Label) =>
        await labelCreator(label.name, label.desc, label.color).catch(() =>
          console.log(`Error in creating ${label.name}?`)
        )
    );
  }

  /**
   * Returns an array of label names matching the requirement of the PR.
   * @param prAction - PRAction Enum describing the type of labels necessary.
   * @returns a string array of label names matching input requirements.
   */
  public getPRLabelNames(prAction: PRAction): string[] {
    const labelNames: string[] = [];

    switch (prAction) {
      case PRAction.CONVERTED_TO_DRAFT:
      case PRAction.OPENED:
        const onGoingLabel = LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, LabelAction.OnGoing);
        if (onGoingLabel) {
          labelNames.push(onGoingLabel.name);
        }
        break;

      case PRAction.READY_FOR_REVIEW:
        const toReviewLabel = LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, LabelAction.ToReview);
        if (toReviewLabel) {
          labelNames.push(toReviewLabel.name);
        }
        break;
    }

    return labelNames;
  }

  /**
   * Checks an array of GHLabel for labels that belong to the input
   * LabelCollectionType Enum and returns a string of said label names.
   * @param labelCollectionType - LabelCollectionType Enum describing the type of labels to be extracted.
   * @param ghLabels - Array of GHLabels of which existing labels are to be extracted.
   * @returns a string array containing extracted label names.
   */
  public static extractLabelNames(labelCollectionType: LabelCollectionType, ghLabels: GHLabel[]) {
    const labelNames: string[] = [];
    for (const label of ghLabels) {
      if (label.name.includes(`${labelCollectionType}.`)) {
        labelNames.push(label.name);
      }
    }
    return labelNames;
  }
}
