"use client";

import { FC, useMemo } from "react";
import { Editor } from "@/components/pages/editor/editor";
import { ProjectData } from "grapesjs";

export const EditorWrapper: FC = () => {
  const initialData = useMemo(() => {
    const data: ProjectData = {
      assets: [],
      pages: [
        {
          name: "Home page",
          component: `<section class="p-2"><h1>Start to styling, double click me to edit</h1></section>`,
        },
      ],
    } as ProjectData;

    data.assets = [];

    data.variables = {
      _meta: { type: "root" },
      globalData: {
        _meta: { type: "group" },
        default_color: {
          _meta: {
            type: "input",
            label: "Default Color",
          },
          value: "red",
        },
      },
    };

    return data;
  }, []);

  return <Editor initialData={initialData} />;
};
