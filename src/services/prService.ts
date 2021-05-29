import GHLabel from '../model/model_ghLabel';
import { LabelAction } from '../model/model_label';
import LabelService from './labelService';
import { LabelCollectionType } from '../model/model_labelCollection';
import { LABEL_ARCHIVE } from '../constants/const_labels';
import { PRAction } from '../model/model_pr';

export default class PRService {
  public static replaceExistingPRLabels(
    labelReplacer: (removalLabelName: string[], replacementLabelNames: string[]) => void,
    existingLabels: GHLabel[],
    prAction: PRAction
  ) {
    const labelNamesToRemove: string[] = LabelService.extractLabelNames(
      LabelCollectionType.PRCollection,
      existingLabels
    );
    const labelNamesToAdd: string[] = [];
    switch (prAction) {
      case PRAction.READY_FOR_REVIEW:
      case PRAction.OPENED:
        labelNamesToAdd.push(LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, LabelAction.ToReview)?.name!);
        break;
      case PRAction.CONVERTED_TO_DRAFT:
        labelNamesToAdd.push(LABEL_ARCHIVE.getLabel(LabelCollectionType.PRCollection, LabelAction.OnGoing)?.name!);
        break;
    }

    labelReplacer(labelNamesToRemove, labelNamesToAdd);
  }
}
