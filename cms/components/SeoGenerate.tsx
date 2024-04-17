import React, { useCallback } from "react";
import { GenerateIcon } from "@sanity/icons";
import { Button, Stack } from "@sanity/ui";
import { randomKey } from "@sanity/util/content";
import * as PathUtils from "@sanity/util/paths";
import {
  insert,
  useFormValue,
  type ObjectInputProps,
  type SlugParent,
} from "sanity";
import type { SanityDocument } from "@sanity/client";

// function getNewFromSource(
//   source: string,
//   valuePath: string[],
//   document: SanityDocument,
// ) {
//   const parentPath = valuePath.slice(0, -1);
//   const parent = PathUtils.get(document, parentPath) as SlugParent;
//   return Promise.resolve(
//     typeof source === "function"
//       ? source(document, { parentPath, parent })
//       : (PathUtils.get(document, source) as string | undefined),
//   );
// }

const CustomSEOGenerate = (props: ObjectInputProps<any>) => {
  const { onChange } = props;
  const type = useFormValue([`_type`]);

  // const handleClick = useCallback(
  //   async (event) => {
  //     const item = {
  //       _key: randomKey(12),
  //       _type: "reference",
  //     };

  //     // Patch the document
  //     onChange(insert([item], "before", [0]));
  //   },
  //   [onChange],
  // );

  return (
    <Stack space={3}>
      <Button
        icon={GenerateIcon}
        text="Quick-generate SEO"
        mode="ghost"
        // onClick={handleClick}
      />
      {props.renderDefault({ ...props, arrayFunctions: () => null })}
    </Stack>
  );
};

export default CustomSEOGenerate;
