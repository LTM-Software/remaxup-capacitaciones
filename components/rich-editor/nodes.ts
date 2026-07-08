import { Node, mergeAttributes } from "@tiptap/core";

// Nodo Video: reproduce inline. YouTube/Vimeo -> iframe; mp4/otros -> <video>.
function youtubeEmbed(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return null;
}

export const VideoNode = Node.create({
  name: "videoBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: "div[data-video-src]" },
      { tag: "video[src]" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src: string = HTMLAttributes.src || "";
    const yt = youtubeEmbed(src);
    if (yt) {
      return [
        "div",
        {
          "data-video-src": src,
          class: "video-embed my-3",
        },
        [
          "iframe",
          {
            src: yt,
            class: "w-full aspect-video rounded-md",
            frameborder: "0",
            allow:
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowfullscreen: "true",
          },
        ],
      ];
    }
    return [
      "div",
      { "data-video-src": src, class: "video-embed my-3" },
      [
        "video",
        {
          src,
          controls: "true",
          class: "w-full rounded-md",
        },
      ],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }: any) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    } as any;
  },
});

// Nodo Archivo: se muestra inline. PDF/Office -> iframe embebido; otros -> tarjeta link.
const OFFICE = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

function extOf(url: string): string {
  return (
    url.split("?")[0].split("#")[0].split(".").pop() || ""
  ).toLowerCase();
}

export const FileNode = Node.create({
  name: "fileEmbed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
      name: { default: "Archivo" },
    };
  },

  parseHTML() {
    return [
      { tag: "div[data-file-url]" },
      { tag: "a[data-file-url]" },
      { tag: "iframe[data-file-url]" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const url: string = HTMLAttributes.url || "";
    const name: string = HTMLAttributes.name || "Archivo";
    // Tarjeta clickeable inline: al abrir, el navegador previsualiza
    // (PDF/imagen/video) o descarga según el tipo de archivo.
    return [
      "a",
      {
        "data-file-url": url,
        "data-file-name": name,
        href: url,
        target: "_blank",
        rel: "noopener noreferrer",
        class: "file-card",
      },
      `📎 ${name}`,
    ];
  },

  addCommands() {
    return {
      setFileEmbed:
        (options: { url: string; name: string }) =>
        ({ commands }: any) =>
          commands.insertContent({
            type: this.name,
            attrs: options,
          }),
    } as any;
  },
});
