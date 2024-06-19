import { PipeTransform } from '@nestjs/common';

export class ConvertStringToNumberPipe implements PipeTransform {
  transform(data: string) {
    const newNumber = Number(data);

    if (isNaN(newNumber)) {
      return undefined;
    }

    return newNumber;
  }
}
