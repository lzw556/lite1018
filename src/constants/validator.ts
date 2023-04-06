export const Rules = {
  required: () => {
    return { required: true };
  },
  range: (min: number, max: number) => {
    return { required: true, min, max, message: `请输入${min}到${max}个字符` };
  },
  number: (): any => {
    return {
      required: true,
      type: 'number',
      transform(value: number) {
        if (value) {
          return Number(value);
        }
        return value;
      }
    };
  },
  float: (): any => {
    return {
      required: true,
      type: 'float',
      transform(value: any) {
        if (value) {
          return parseFloat(value);
        }
        return value;
      }
    };
  },
  macAddress: (): any => {
    return {
      required: true,
      transform(value: any) {
        return value;
      },
      pattern: /^([0-9a-fA-F]{2})(([0-9a-fA-F]{2}){5})$/,
      message: 'MAC地址格式不正确'
    };
  }
};

export const Normalizes = {
  float: (value: any) => {
    if (value) {
      return parseFloat(value);
    }
    return value;
  },
  number: (value: any) => {
    if (value) {
      return Number(value);
    }
    return value;
  },
  macAddress: (value: string) => {
    if (value) {
      return value.toLowerCase().replaceAll('-', '');
    }
  }
};
