import { ReactElement } from "react";
import { serverDataProvider } from "@/components/providers/server-side-data-provider";
import { notFound } from "next/navigation";
import grapesjs, { ProjectData } from "grapesjs";
import { Invitation } from "@/components/providers/payload-types";
import { GjsPluginCanvasFullSize } from "@/components/pages/editor/plugins/canvas-full-size";
import { GjsPluginSectionBlock } from "@/components/pages/editor/plugins/section-block/plugin";
import { GjsPluginBasicBlocks } from "@/components/pages/editor/plugins/basic-blocks";
import GjsPluginBlockBasic from "grapesjs-blocks-basic";

const client = serverDataProvider();

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export async function generateMetadata(
  { params }: Props
  // parent: ResolvingMetadata
) {
  const { slug } = await params;
  const res = await client.getOne<Invitation>({
    resource: "invitations",
    id: 0,
    meta: {
      slug,
    },
  });
  const data = res.data;
  if (!data) {
    return {
      title: "Not Found - Preview",
      description: "No invitation found",
    };
  }
  return {
    title: `Preview: ${data.title} - Undangon`,
    description: `This is the preview of ${data.title} invitation`,
  };
}

export default async function InvitationPreviewPage({
  params,
}: Props): Promise<ReactElement> {
  const { slug } = await params;
  const res = await client.getOne<Invitation>({
    resource: "invitations",
    id: 0,
    meta: {
      slug,
    },
  });

  if (!res.data) {
    notFound();
  }

  const editor = grapesjs.init({
    projectData: res.data.data as ProjectData,
    headless: true,
    plugins: [
      GjsPluginCanvasFullSize,
      GjsPluginBlockBasic,
      GjsPluginBasicBlocks,
      GjsPluginSectionBlock,
    ],
  });
  const html = editor.getHtml({
    asDocument: false,
    tag: "div",
    keepInlineStyle: true,
  });

  return (
    <div dangerouslySetInnerHTML={{ __html: html }}>
      {/* <GenerateContent data={{}} /> */}
    </div>
  );
}
