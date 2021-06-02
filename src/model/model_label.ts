import { createHash } from 'crypto';
import GHLabel from './model_ghLabel';

/**
 * Enum exists as an accessible Identification
 * for each created label.
 * NOTE: Each LabelAction is unique and can only
 * be assigned once to a Label.
 */
export enum LabelAction {
  ToReview = 'ToReview',
  ToMerge = 'ToMerge',
  OnGoing = 'OnGoing',
  Paused = 'OnHold',
  Bug = 'Bug',
  WontFix = 'WontFix',
  Feature = 'Feature',
  Documentation = 'Doc',
  Enhancement = 'Enhancement',
}

export default class Label {
  private _name: string;
  private _desc: string;
  private _color: string;
  private _hash: string;
  private _aliases: string[];
  private _action: LabelAction;

  constructor(name: string, desc: string, color: string, substr: string | string[], action: LabelAction) {
    this._name = name;
    this._desc = desc;
    this._color = color;
    this._hash = Label.GenerateHash(name, desc, color);
    this._aliases = (typeof substr === 'string' || substr instanceof String ? [substr] : substr) as string[];
    this._action = action;
  }

  private static GenerateHash(name: string, desc: string, color: string) {
    const hash = createHash('sha256');
    hash.update(name);
    hash.update(desc);
    hash.update(color);
    return hash.digest('hex');
  }

  public get name(): string {
    return this._name;
  }

  public get desc(): string {
    return this._desc;
  }

  public get color(): string {
    return this._color;
  }

  public get hash(): string {
    return this._hash;
  }

  public get labelAlias(): string[] {
    return this._aliases;
  }

  public get action(): LabelAction {
    return this._action;
  }

  public isEquivalentToGHLabel(ghLabel: GHLabel): boolean {
    return (
      this._name === ghLabel.name &&
      this._desc === ghLabel.description &&
      this._color === ghLabel.color
    );
  }
}