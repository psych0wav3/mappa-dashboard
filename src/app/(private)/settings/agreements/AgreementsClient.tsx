"use client";

import * as React from "react";

import {
  FileText,
  Plus,
  Power,
} from "lucide-react";

import {
  toast,
} from "sonner";

import FormPageHeader from "@/components/form-layout/FormPageHeader";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  getErrorMessage,
} from "@/lib/mappa/errors";

import {
  createAgreement,
  listAgreementsAdmin,
  updateAgreementStatus,
  type Agreement,
} from "./actions";

export default function AgreementsClient({
  initialAgreements,
}: {
  initialAgreements: Agreement[];
}) {
  const [
    items,
    setItems,
  ] =
    React.useState(
      initialAgreements,
    );

  const [
    title,
    setTitle,
  ] =
    React.useState("");

  const [
    version,
    setVersion,
  ] =
    React.useState("1");

  const [
    content,
    setContent,
  ] =
    React.useState("");

  const [
    saving,
    setSaving,
  ] =
    React.useState(false);

  const [
    togglingId,
    setTogglingId,
  ] =
    React.useState<
      string | null
    >(null);

  const handleCreate =
    async () => {
      try {
        setSaving(true);

        const created =
          await createAgreement(
            {
              title,
              content,
              version,
            },
          );

        setItems(
          (previous) => [
            created,
            ...previous,
          ],
        );

        setTitle("");
        setVersion("1");
        setContent("");

        toast.success(
          "Termo criado.",
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Não foi possível criar o termo.",
          ),
        );
      } finally {
        setSaving(false);
      }
    };

  const handleToggle =
    async (
      agreement: Agreement,
    ) => {
      try {
        setTogglingId(
          agreement.id,
        );

        const updated =
          await updateAgreementStatus(
            {
              agreementId:
                agreement.id,

              isActive:
                !agreement.isActive,
            },
          );

        setItems(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                updated.id
                  ? updated
                  : item,
            ),
        );

        toast.success(
          updated.isActive
            ? "Termo ativado."
            : "Termo desativado.",
        );
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Não foi possível atualizar o termo.",
          ),
        );
      } finally {
        setTogglingId(
          null,
        );
      }
    };

  const refresh =
    async () => {
      try {
        const next =
          await listAgreementsAdmin(
            false,
          );

        setItems(next);
      } catch (error) {
        toast.error(
          getErrorMessage(
            error,
            "Falha ao recarregar.",
          ),
        );
      }
    };

  return (
    <div className="flex w-full flex-col gap-5">
      <FormPageHeader
        icon={FileText}
        title="Termos e acordos"
        description="Termos globais da plataforma. Técnicos, clientes e admins precisam aceitar ao menos uma vez."
        actions={
          <Button
            variant="outline"
            onClick={
              refresh
            }
          >
            Atualizar
          </Button>
        }
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-slate-900">
          <Plus className="h-4 w-4" />

          <h2 className="font-semibold">
            Novo termo
          </h2>
        </div>

        <div className="grid gap-3">
          <Input
            placeholder="Título"
            value={title}
            onChange={(
              event,
            ) =>
              setTitle(
                event.target
                  .value,
              )
            }
          />

          <Input
            placeholder="Versão (ex.: 1.0)"
            value={version}
            onChange={(
              event,
            ) =>
              setVersion(
                event.target
                  .value,
              )
            }
          />

          <textarea
            className="min-h-40 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="Conteúdo do termo"
            value={content}
            onChange={(
              event,
            ) =>
              setContent(
                event.target
                  .value,
              )
            }
          />

          <div className="flex justify-end">
            <Button
              onClick={
                handleCreate
              }
              disabled={
                saving
              }
            >
              {saving
                ? "Salvando..."
                : "Publicar termo"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {items.length ===
        0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Nenhum termo
            cadastrado ainda.
          </div>
        ) : (
          items.map(
            (item) => (
              <article
                key={
                  item.id
                }
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-sky-700" />

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {
                          item.title
                        }
                      </h3>

                      <p className="text-xs text-slate-500">
                        Versão{" "}
                        {
                          item.version
                        }{" "}
                        ·{" "}
                        {item.isActive
                          ? "Ativo"
                          : "Inativo"}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      togglingId ===
                      item.id
                    }
                    onClick={() =>
                      handleToggle(
                        item,
                      )
                    }
                  >
                    <Power className="mr-1 h-3.5 w-3.5" />

                    {item.isActive
                      ? "Desativar"
                      : "Ativar"}
                  </Button>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                  {
                    item.content
                  }
                </p>
              </article>
            ),
          )
        )}
      </section>
    </div>
  );
}