import { createHash } from 'crypto';
import GHLabel, { isGHLabel } from './model_ghLabel';
import LabelType from './model_label_type';

export default class Label {
  private _name: string;
  private _desc: string;
  private _color: string;
  private _hash: string;
  private _aliases: string[];
  private _action: LabelType;

  constructor(name: string, desc: string, color: string, substr: string | string[], action: LabelType) {
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

  public static isLabel(object: any): object is Label {
    return object instanceof Label;
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

  public get type(): LabelType {
    return this._action;
  }

  public equal(label: Label): boolean;
  public equal(ghLabel: GHLabel): boolean;
  public equal(labelObject: Label | GHLabel): boolean {
    if (Label.isLabel(labelObject)) {
      return (
        this._name === labelObject.name &&
        this._desc === labelObject.desc &&
        this._color === labelObject.color
      );
    } else if (isGHLabel(labelObject)) {
      return (
        this._name === labelObject.name &&
        this._desc === labelObject.description &&
        this._color === labelObject.color
      );
    } else {
      throw new Error('Comparison object type unrecognized.');
    }
  }
}