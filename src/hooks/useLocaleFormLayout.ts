import { FormLayout } from 'antd/es/form/Form';
import { useLocaleContext } from '../localeProvider';
import { ColProps } from 'antd';

export function useLocaleFormLayout(
  defaultLabelCol: number = 6,
  layout?: FormLayout
): {
  layout: FormLayout;
  labelCol: ColProps;
} {
  const { language } = useLocaleContext();
  return {
    layout: layout ?? (language === 'en-US' ? 'vertical' : 'horizontal'),
    labelCol: { span: language === 'en-US' ? 24 : defaultLabelCol }
  };
}
