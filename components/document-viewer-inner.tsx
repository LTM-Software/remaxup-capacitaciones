"use client";

import DocViewer, {
  DocViewerRenderers,
} from "@cyntler/react-doc-viewer";

interface DocumentViewerInnerProps {
  url: string;
  fileName?: string;
}

// Se importa dinámicamente con ssr:false desde document-viewer-modal
// porque @cyntler/react-doc-viewer no soporta SSR.
export default function DocumentViewerInner({
  url,
  fileName,
}: DocumentViewerInnerProps) {
  return (
    <DocViewer
      documents={[{ uri: url, fileName }]}
      pluginRenderers={DocViewerRenderers}
      config={{
        header: { disableHeader: true },
        pdfVerticalScrollByDefault: true,
      }}
      style={{ height: "72vh", width: "100%" }}
    />
  );
}
