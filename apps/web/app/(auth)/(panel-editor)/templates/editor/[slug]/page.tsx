"use client";

import { ReactElement } from "react";
import { Media, Template } from "@/components/providers/payload-types";
import { useList, useShow } from "@refinedev/core";
import { useParams } from "next/navigation";
import { LoadingOverlay } from "@/components/refine-ui/layout/loading-overlay";
import { EditorWrapper } from "./editor";
import { LoadingPage } from "@/components/pages/loading-page";
import Head from "next/head";

export default function EditorPage(): ReactElement {
  const params = useParams();
  const {
    result: template,
    query: { isLoading: templateLoading, error },
  } = useShow<Template>({
    resource: "templates",
    id: 100,
    meta: {
      slug: params.slug as string,
    },
  });

  const {
    result: media,
    query: { isLoading: mediaLoading },
  } = useList<Media>({
    resource: "media",
  });

  if (error) return <div>Something error</div>;
  if (templateLoading || mediaLoading)
    return <LoadingPage label="Fetching data" />;
  return (
    <div className="fixed inset-0">
      <Head>
        <title>Template Editor</title>
      </Head>
      <LoadingOverlay loading={templateLoading}>
        {template && media.data && (
          <EditorWrapper template={template} assets={media.data} />
        )}
      </LoadingOverlay>
    </div>
  );
}
