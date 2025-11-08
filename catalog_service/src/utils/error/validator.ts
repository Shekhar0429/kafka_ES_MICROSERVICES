import { validate } from "class-validator";
export const ValidateError = async (
  input: any
): Promise<Record<string, any> | false> => {
  const errors = await validate(input, {
    validationError: { target: true, property: true },
  });
  if (errors.length) {
    return errors.map((err) => ({
      field: err.property,
      message:
        (err.constraints && Object.values(err.constraints)[0]) ||
        "Please provide valid value",
    }));
  }
  return false;
};
