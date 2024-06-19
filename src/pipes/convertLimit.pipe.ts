import { LIMIT_DEFAULT } from '@constants/commons.constant';
import { PipeTransform } from '@nestjs/common';

export class ConvertLimitPipe implements PipeTransform {
  transform(data: string) {
    const limit = Number(data);

    if (Number.isNaN(limit) || limit <= 0) {
      return LIMIT_DEFAULT;
    }

    return limit;
  }
}
