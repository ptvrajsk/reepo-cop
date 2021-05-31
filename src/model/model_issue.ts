import GHIssue from './model_ghIssue';
import Label from './model_label';
import { LABEL_ARCHIVE } from '../constants/const_labels';

export default class Issue {
  _number: number;
  _title: string;
  _labels: Label[];
  _commentsCount: number;
  _body: string;

  constructor(ghIssue: GHIssue) {
    this._number = ghIssue.number;
    this._title = ghIssue.title;
    this._labels = LABEL_ARCHIVE.mapGHLabels(ghIssue.labels);
    this._commentsCount = ghIssue.comments;
    this._body = ghIssue.body;
  }
}