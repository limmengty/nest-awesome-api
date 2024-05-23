import { ValueTransformer } from 'typeorm';
import { Hash } from '../../utils/Hash';

export class PasswordTransformer implements ValueTransformer {
  /**
   * Transform to custom value
   * @param value value to transform
   */
  to(value) {
    if (value == undefined) {
      // for OAuth2 User
      return Hash.make('prop');
    }
    console.log(Hash.make(value));
    return Hash.make(value);
  }

  /**
   * Original value
   * @param value to be transformed
   */
  from(value) {
    console.log('value:', value);
    return value;
  }
}
