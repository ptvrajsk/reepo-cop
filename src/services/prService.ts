import GHLabel from '../model/model_ghLabel';
import LabelService from './labelService';
import { LabelCollectionType } from '../model/model_labelCollection';
import { LABEL_ARCHIVE } from '../constants/const_labels';
import { PRAction } from '../model/model_pr';
import { PRType } from '../model/model_label_type';

export default class PRService {

  /**
   * Replaces existing PR Labels with new labels based on the PR Action.
   * @param labelReplacer - A function that removes a set of labels and adds another to a PR.
   * @param existingLabels - Existing set of Labels on said PR.
   * @param prAction - Type of action taking place on said PR.
   */
  public replaceExistingPRLabels(
    labelReplacer: (removalLabelName: string[], replacementLabelNames: string[]) => Promise<boolean>,
    existingLabels: GHLabel[],
    prAction: PRAction
  ): Promise<boolean> {
    const labelNamesToRemove: string[] = LabelService.extractLabelNames(
      LabelCollectionType.PRCollection,
      existingLabels
    );
    const labelNamesToAdd: string[] = [];
    switch (prAction) {
      case PRAction.READY_FOR_REVIEW:
      case PRAction.OPENED:
        labelNamesToAdd.push(LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, PRType.ToReview)?.name!);
        break;
      case PRAction.CONVERTED_TO_DRAFT:
        labelNamesToAdd.push(LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, PRType.OnGoing)?.name!);
        break;
    }

    return labelReplacer(labelNamesToRemove, labelNamesToAdd);
  }
}
