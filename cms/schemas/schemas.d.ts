import * as s from "sanity";

declare module "sanity" {
  interface FieldDefinitionBase {
    codegen?: { required: boolean };
  }
}
