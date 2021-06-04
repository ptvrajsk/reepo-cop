import GHLabel from '../model/model_ghLabel';
import Label from '../model/model_label';
import { LabelCollectionType } from '../model/model_labelCollection';
import { PRAction } from '../model/model_pr';
import { LABEL_ARCHIVE } from '../constants/const_labels';
import { PRType } from '../model/model_label_type';

export default class LabelService {
  /**
   * Sieves outdated and missing labels and returns data in types
   * useful for rectification.
   * @param ghLabels - Github Labels to be filtered.
   * @returns object containing missing labels -> Label[] & outdatedLabels -> Map<GHLabel, Label>.
   */
  public static fetchMissingAndOutdatedLabels(ghLabels: GHLabel[]): {
    missingLabels: Label[];
    outdatedLabels: Map<GHLabel, Label>;
  } {
    const missingLabels: Label[] = LABEL_ARCHIVE.collatePresetLabels();
    const outdatedLabels: Map<GHLabel, Label> = new Map<GHLabel, Label>();
    const presetSubstrIdentifiers: Map<string[], Label> = LABEL_ARCHIVE.collatePresetSubstringMap();

    presetSubstrIdentifiers.forEach(async (label: Label, substrings: string[]) => {
      for (const substr of substrings) {
        let isMatched = false;

        for (const ghLabelIndex in ghLabels) {
          if (ghLabels[ghLabelIndex].name.toLowerCase().includes(substr)) {
            isMatched = true;

            if (!label.equal(ghLabels[ghLabelIndex])) {
              outdatedLabels.set(ghLabels[ghLabelIndex], label);
            }

            ghLabels.splice(+ghLabelIndex, 1);
            const outdatedLabelIndex: number = missingLabels.findIndex(
              (missingLabel: Label) => missingLabel.name === label.name
            );
            missingLabels.splice(outdatedLabelIndex, 1);
            break;
          }
        }
        if (isMatched) {
          break;
        }
      }
    });

    return {
      missingLabels: missingLabels,
      outdatedLabels: outdatedLabels,
    };
  }

  /**
   * Updates any existing labels that match the set of preset labels.
   * @param octokitLabelsFetchResponse - Label data fetched from Github
   * @param labelUpdater - Callback function that allows for label updating on Github.
   * @returns List of updated Labels.
   */
  public static async updateLabels(
    outdatedLabels: Map<GHLabel, Label>,
    labelUpdater: (oldName: string, newName: string, desc: string, color: string) => Promise<boolean>
  ): Promise<boolean> {
    const updateResults: boolean[] = [true];

    outdatedLabels.forEach(async (updatedLabel: Label, outdatedLabel: GHLabel) => {
      const labelUpdateResult: boolean = await labelUpdater(
        outdatedLabel.name,
        updatedLabel.name,
        updatedLabel.desc,
        updatedLabel.color
      );

      if (!labelUpdateResult) {
        console.log(`Failed to update label: ${outdatedLabel.name}.`);
      }

      updateResults.push(labelUpdateResult);
    });

    return updateResults.reduce((previousValue: boolean, currentValue: boolean) => previousValue && currentValue);
  }

  public static async createLabels(
    missingLabels: Label[],
    labelCreator: (name: string, desc: string, color: string) => Promise<boolean>
  ) {
    const createResults: boolean[] = [true];

    for (const label of missingLabels) {
      const creationResult: boolean = await labelCreator(label.name, label.desc, label.color);

      if (!creationResult) {
        console.log(`Failed to create label: ${label.name}.`);
      }

      createResults.push(creationResult);
    }

    return createResults.reduce((previousValue: boolean, currentValue: boolean) => previousValue && currentValue);
  }

  /**
   * Creates remaining missing labels on Github.
   * @param remainingLabels - Labels that are missing from Github.
   * @param repoLabelCreator - Callback function that enables Label Creation.
   */
  public async validateLabelsOnGihtub(
    repoLabelsRetriever: () => Promise<GHLabel[]>,
    repoLabelUpdater: (oldName: string, newName: string, desc: string, color: string) => Promise<boolean>,
    repoLabelCreator: (name: string, desc: string, color: string) => Promise<boolean>
  ): Promise<boolean> {
    const { missingLabels, outdatedLabels }: { missingLabels: Label[]; outdatedLabels: Map<GHLabel, Label> } =
      LabelService.fetchMissingAndOutdatedLabels(await repoLabelsRetriever());

    const updateResult: boolean = await LabelService.updateLabels(outdatedLabels, repoLabelUpdater);
    const createResult: boolean = await LabelService.createLabels(missingLabels, repoLabelCreator);

    return updateResult && createResult;
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
        const onGoingLabel = LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, PRType.OnGoing);
        if (onGoingLabel) {
          labelNames.push(onGoingLabel.name);
        }
        break;

      case PRAction.READY_FOR_REVIEW:
        const toReviewLabel = LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, PRType.ToReview);
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
