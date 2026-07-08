"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentFromTemplate } from "@/types/next-auth";
import Link from "next/link";
import { HtmlPreviewModal } from "@/components/html-preview-modal";

export const createColumns = (
  propertyId: string
): ColumnDef<DocumentFromTemplate>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Documento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "documentName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Nombre del documento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() =>
            column.toggleSorting(column.getIsSorted() === "asc")
          }
        >
          Descripción
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const doc = row.original as DocumentFromTemplate & {
        content?: string;
      };
      const href = `/documentos/${propertyId}/documentFromTemplate/${doc.id}`;

      return (
        <div className="flex items-center justify-end gap-x-2">
          <HtmlPreviewModal
            title={doc.title}
            content={doc.content}
          >
            <Button variant="ghost" size="sm" className="h-8">
              <Eye className="h-4 w-4 mr-1" />
              Vista previa
            </Button>
          </HtmlPreviewModal>
          <Link href={href}>
            <Button variant="ghost" size="sm" className="h-8">
              <ExternalLink className="h-4 w-4 mr-1" />
              Abrir
            </Button>
          </Link>
        </div>
      );
    },
  },
];
