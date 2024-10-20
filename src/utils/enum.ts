import { Option } from '../common';
type NumericEnum = { [key: string | number]: number | string };

export const pickOptionsFromNumericEnum = (em: NumericEnum, labelPrefix?: string) => {
  const options: Option[] = [];
  for (const key in em) {
    if (Number.isInteger(Number(key))) {
      const optionLabel = (em[key] as string).toLocaleLowerCase();
      const optionValue = Number(key);
      options.push({ label: `${labelPrefix}${optionLabel}`, value: optionValue });
    }
  }
  return options;
};
