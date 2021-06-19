import GHPr from '../model/model_ghPR';
import GHRelease from '../model/model_ghRelease';
import PullRequest from '../model/model_pr';

export default class ReleaseService {
  private readonly CHANGELOG_TITLE: string = '## Changelog';
  private readonly OTHERS_HEADER: string = '### 🧱 Others\n';
  private readonly headerGenerator: (labelName: string) => string = (labelName: string) => {
    const [emoji, title, ..._]: [emoji?: string, title?: string, ..._: string[]] = labelName.split(/ .*\./);
    return `### ${emoji} ${title}\n`;
  };

  /**
   * Updates a release body with a changelog of all PRs merged after the last release.
   * @param currentRelease - GHRelease object that is the currrent drafted release.
   * @param last_release_retriever - Function that fetches the last published release.
   * @param merged_pr_retriever - Function that retreives merged pull requests based on
   * input filters.
   * @param release_body_updater - Funtion that updates the current release body.
   * @returns promise of true of true if release body updating was successful false
   * otherwise.
   */
  public async updateReleaseChangelog(
    currentRelease: GHRelease,
    last_release_retriever: () => Promise<GHRelease | undefined>,
    merged_pr_retriever: ({
      pr_per_page,
      pages,
      filter,
      date_range,
    }: {
      pr_per_page?: number;
      pages?: number;
      filter?: 'draft' | 'merged';
      date_range?: { startDate?: Date; endDate?: Date };
    }) => Promise<GHPr[]>,
    release_body_updater: (currentRelease: GHRelease, newReleaseBody: string) => Promise<boolean>
  ): Promise<boolean> {
    //! Do not make changes on a release that is not a draft.
    if (!currentRelease.draft) {
      return true;
    }

    const lastRelease: GHRelease | undefined = await last_release_retriever();
    const recentlyMergedPRs: PullRequest[] = (
      await merged_pr_retriever({
        filter: 'merged',
        date_range: { startDate: lastRelease ? new Date(lastRelease.published_at!) : undefined },
      })
    ).map((ghPr: GHPr) => new PullRequest(ghPr));

    const newReleaseBody: string = this.addChangelogToReleaseBody(
      currentRelease,
      this.draftChangelog(recentlyMergedPRs)
    );
    return await release_body_updater(currentRelease, newReleaseBody);
  }

  /**
   *
   * @param currentRelease - GHRelease object.
   * @param changelog - string that is to be added to a release body.
   * @returns string containing newly updated release body.
   */
  private addChangelogToReleaseBody(currentRelease: GHRelease, changelog: string): string {
    const changelogRegex: RegExp = new RegExp(`${this.CHANGELOG_TITLE}\n*.*`, 'gs');
    const isChangelogInBody: boolean = changelogRegex.test(currentRelease.body);

    if (!isChangelogInBody) {
      return `${currentRelease.body.trimEnd()}\n\n${changelog}`;
    }

    const existingChangelog: string = currentRelease.body.match(changelogRegex)![0];
    return currentRelease.body.replace(existingChangelog, changelog).trimEnd();
  }

  /**
   * Creates a string containing a formatted changelog
   * @param pullRequests - List of Pull Requests to add to changelog.
   * @returns string representing a format list of changes.
   */
  private draftChangelog(pullRequests: PullRequest[]): string {
    const changelogCollation: { [changelogHeader: string]: string } = {};

    pullRequests.forEach((pullRequest: PullRequest) => {
      const labelName: string | undefined = pullRequest.getIssueLabel()?.name;

      // * Complex 1 Liner that Updates / Creates new Collated Changelog.
      changelogCollation[labelName ? this.headerGenerator(labelName) : this.OTHERS_HEADER] = changelogCollation[
        labelName ? this.headerGenerator(labelName) : this.OTHERS_HEADER
      ]
        ? `${changelogCollation[this.OTHERS_HEADER]}- ${pullRequest.title} (#${pullRequest.number})\n`
        : `- ${pullRequest.title} (#${pullRequest.number})\n`;
    });

    let changelog: string = `${this.CHANGELOG_TITLE}\n`;
    for (const header in changelogCollation) {
      changelog = `${changelog}${header}${changelogCollation[header]}`;
    }

    return changelog;
  }
}