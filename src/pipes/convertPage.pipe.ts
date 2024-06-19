import { PAGE_DEFAULT } from '@constants/commons.constant';
import { PipeTransform } from '@nestjs/common';

export class ConvertPagePipe implements PipeTransform {
  transform(data: string) {
    const page = Number(data);

    if (Number.isNaN(page) || page <= 0) {
      return PAGE_DEFAULT;
    }

    return page;
  }
}
