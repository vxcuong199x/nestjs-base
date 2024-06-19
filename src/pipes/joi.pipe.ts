import { HTTP_CODE } from '@constants/httpCode.constant';
import { STATUS_CODE } from '@constants/statusCode.constant';
import { CustomHttpException } from '@myClasses/customHttpExeption';
import { Injectable, PipeTransform } from '@nestjs/common';
import { i18nDecode, isI18nMessage } from '@utils/i18n.util';
import * as Joi from 'joi';
const joiI18nPrefix = 'joi';
const logContext = 'JoiValidationPipe';

export const joiI18nPrefixMessage = (message: string): string =>
  `${joiI18nPrefix}.${message}`;

@Injectable()
export class JoiPipe implements PipeTransform {
  constructor(
    private joiSchema: Joi.Schema,
    private options?: { abortEarly?: boolean; allowUnknown?: boolean },
  ) {}
  transform(data: any) {
    const { abortEarly = true, allowUnknown = false } = this.options || {};

    const result = this.joiSchema.validate(data, {
      abortEarly,
      allowUnknown,
    });

    const { value, error } = result;

    if (error) {
      const exeptionDetail = error.details[0];

      const { message, type, context } = exeptionDetail;

      const newMessage = isI18nMessage(message)
        ? i18nDecode(message)
        : joiI18nPrefixMessage(type);

      throw new CustomHttpException(
        newMessage,
        HTTP_CODE.BAD_REQUEST,
        STATUS_CODE.ERROR_VALIDATE,
        {
          i18nArgs: context,
          extraInfo: JSON.stringify(data),
          context: logContext,
        },
      );
    }

    return value;
  }
}
