import { createHash } from 'crypto';

/**
 * Enum exists as an accessible Identification
 * for each created label.
 * NOTE: Each LabelAction is unique and can only
 * be assigned once to a Label.
 */
export enum LabelAction {
  ToReview = 'To Review',
  ToMerge = 'To Merge',
  OnGoing = 'On Going',
  Paused = 'OnHold',
  Bug = 'Bug',
  WontFix = 'Wont Fix',
  Feature = 'Feature',
  Documentation = 'Documentation',
  Enhancement = 'Enhancement',
}

export default class Label {
  private _name: string;
  private _desc: string;
  private _color: string;
  private _identifier: string;
  private _aliases: string[];
  private _action: LabelAction;

  constructor(name: string, desc: string, color: string, substr: string | string[], action: LabelAction) {
    this._name = name;
    this._desc = desc;
    this._color = color;
    this._identifier = Label.GenerateIdentifier(name, desc, color);
    this._aliases = (typeof substr === 'string' || substr instanceof String ? [substr] : substr) as string[];
    this._action = action;
  }

  public static GenerateIdentifier(name: string, desc: string, color: string) {
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

  public get identifier(): string {
    return this._identifier;
  }

  public get labelAlias(): string[] {
    return this._aliases;
  }

  public get action(): LabelAction {
    return this._action;
  }
}