import { createHash } from 'crypto';

class Label {
    private _labelName: string;
    private _labelDesc: string;
    private _labelColor: string;
    private _labelIdentifier: string;
    private _labelSubstr: string[];

    constructor(labelName: string, labelDesc: string, labelColor: string, labelSubstr: string | string[]) {
        this._labelName = labelName;
        this._labelDesc = labelDesc;
        this._labelColor = labelColor;
        this._labelIdentifier = Label.GenerateIdentifier(labelName, labelDesc, labelColor);
        this._labelSubstr = ((typeof labelSubstr === 'string' || labelSubstr instanceof String) ? [labelSubstr] : labelSubstr) as string[]; 
    }

    public static GenerateIdentifier(labelName: string, labelDesc: string, labelColor: string) {
        const hash = createHash('sha256');
        hash.update(labelName);
        hash.update(labelDesc);
        hash.update(labelColor);
        return hash.digest('hex');
    }

    public get labelName(): string {
        return this._labelName;
    }

    public get labelDesc(): string {
        return this._labelDesc;
    }

    public get labelColor(): string {
        return this._labelColor;
    }

    public get labelIdentifier(): string {
        return this._labelIdentifier;
    }

    public get labelSubString(): string[] {
        return this._labelSubstr;
    }
}

class LabelCollection {
    private _collectionName: string;
    private _labels: Label[];

    constructor(collectionName: string, labels: Label[]) {
        this._collectionName = collectionName;
        this._labels = labels;
    }

    public get collectionName(): string {
        return this._collectionName;
    }

    public get labels(): Label[] {
        return this._labels;
    }
}

const LABELS_COLLECTIONS: LabelCollection[] = [
    new LabelCollection(
        'Issue Labels',
        [
            new Label('🐞 issue.Bug', 'This issue describes a bug.', 'D73A4A', 'bug'),
            new Label('⚙️ issue.Feature', 'This issue describes a new feature.', '120BB0', 'feature'),
            new Label('📈 issue.Enhancement', 'This issue describes an enhancement to an existing feature.', '19504B', 'enhance'),
            new Label('📚 issue.Documentation', 'This issue describes a change to the existing documentation.', '0075CA', 'doc'),
            new Label('❌ issue.WontFix', 'This issue describes a suggestion that will not be fixed.', 'FFFFFF', 'wontfix')
        ]
    ),
    new LabelCollection(
        'PR Labels',
        [
            new Label('🏃 pr.Ongoing', 'This PR is still in progress.', '2FEFDD', ['progress', 'ongoing']),
            new Label('👍 pr.ToMerge', 'This PR is ready for merger.', '0E8A16', 'merge'),
            new Label('🔬 pr.ToReview', 'This PR is ready for review.', 'BA50EB', 'review'),
            new Label('🛑 pr.OnHold', 'This PR\'s progress is halted.', 'C5DEF5', 'hold')
        ]
    )
]

export interface OctokitLabelResponse {
    name: string;
    description: string;
    color: string;
}

export class LabelService {

    private collatePresetSubstrings(): Map<string[], Label> {
        const presetSubstrMap: Map<string[], Label> = new Map();
        LABELS_COLLECTIONS.forEach((labelCollection: LabelCollection) => {
            labelCollection.labels.forEach((label: Label) => {
                presetSubstrMap.set(label.labelSubString, label)
            })
        })
        return presetSubstrMap;
    }

    private collatePresetLabels(): Label[] {
        return LABELS_COLLECTIONS.flatMap((labelCollection: LabelCollection) => {
            return labelCollection.labels
        });
    }

    /**
     * Updates any existing labels that match the set of preset labels.
     * @param octokitLabelsFetchResponse - Label data fetched from Github
     * @param labelCreator - Callback function that allows for Label creation on Github.
     * @param labelUpdater - Callback function that allows for label updating on Github.
     * @returns List of updated Labels.
     */
    public updateLabels(octokitLabelsFetchResponse: OctokitLabelResponse[],
        labelUpdater: (oldName: string, newName: string, desc: string, color: string) => Promise<any>
        ): Label[] {
        
        let remainingLabels: Label[] = this.collatePresetLabels();
        const presetSubstrIdentifiers: Map<string[], Label> = this.collatePresetSubstrings();
        presetSubstrIdentifiers.forEach((label:Label, substrings: string[]) => {
            for (const substr of substrings) {
                let isMatched = false;
                
                for(const labelResponseIndex in octokitLabelsFetchResponse) {

                    if(octokitLabelsFetchResponse[labelResponseIndex].name.toLowerCase().includes(substr)) {
                        
                        isMatched = true;

                        if (this.doesLabelNeedUpdating(label, octokitLabelsFetchResponse[labelResponseIndex])) {
                            labelUpdater(octokitLabelsFetchResponse[labelResponseIndex].name, label.labelName, label.labelDesc, label.labelColor);   
                        }

                        octokitLabelsFetchResponse.splice(+labelResponseIndex, 1);
                        remainingLabels = remainingLabels.filter((labelFromAll: Label) => labelFromAll.labelName !== label.labelName);
                        break;
                    }
                }
                if (isMatched) {
                    break;
                }
            };
        });
        
        return remainingLabels;
    }

    private doesLabelNeedUpdating(comparisonLabel: Label, labelResponse: OctokitLabelResponse): boolean {
        return !(comparisonLabel.labelName === labelResponse.name
            && comparisonLabel.labelDesc === labelResponse.description
            && comparisonLabel.labelColor === labelResponse.color);
    }

    /**
     * Creates remaining missing labels on Github.
     * @param remainingLabels - Labels that are missing from Github.
     * @param labelCreator - Callback function that enables Label Creation.
     */
    public generateMissingLabels(remainingLabels: Label[],
        labelCreator: (name: string, desc: string, color: string) => Promise<any>
    ): void {

        remainingLabels.forEach(async (label: Label) => 
            await labelCreator(label.labelName, label.labelDesc, label.labelColor)
                .catch(() => console.log(`Error in creating ${label.labelName}?`))
        );
    }
}
