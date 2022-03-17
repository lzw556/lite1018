import { FIRST_CLASS_PROPERTIES } from "../../constants/field";
import { Property } from "../../types/property";

export const getValueOfFirstClassProperty = (values: any, properties: Property[], typeId:number) => {
  const fields = Object.keys(values);
  if (fields.length === 0 || fields.map((field) => values[field]).every((val) => !val)) return [];
  let data: any = [];
  const firstClassProperties = getFirstClassProperties(typeId, properties);
  fields.forEach((field) => {
    const property = firstClassProperties.find((pro) =>
      pro.fields.find((subpro) => subpro.key === field)
    );
    if (property && !data.find((pro: any) => pro.key === property.key)) {
      data.push({
        ...property,
        fields: property.fields.map((item) => ({ ...item, value: values[field] }))
      });
    }
  });
  if (data.length > 0) data = data.sort((pro1: any, pro2: any) => pro1.sort - pro2.sort);
  return data;
};

const getFirstClassProperties = (typeId:number, properties: Property[]) => {
  const property = FIRST_CLASS_PROPERTIES.find((pro) => pro.typeId === typeId);
  const keys = property ? property.properties : [];
  return properties
    .filter((pro) => pro.fields.find((field) => keys.find((key) => key === field.key)))
    .map((pro) => {
      return {
        ...pro,
        fields: pro.fields.map((field) => ({
          ...field,
          important: !!keys.find((key) => key === field.key)
        }))
      };
    });
};