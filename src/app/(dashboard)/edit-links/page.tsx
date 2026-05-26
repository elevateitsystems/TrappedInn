"use client";
import { useState } from "react";
import {
  useGetLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  useReorderLinks,
  getGetLinksQueryKey,
} from "@/lib/api-client";

import { useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { GripVertical, Pencil, Trash2, Plus, Check, X, Loader2, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  position: number;
}

interface LinkForm {
  title: string;
  url: string;
}

function LinkRow({
  link,
  dragHandleProps,
  onDelete,
  onUpdate,
}: {
  link: { id: string; title: string; url: string; position: number };
  dragHandleProps: any;
  onDelete: () => void;
  onUpdate: (data: LinkForm) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<LinkForm>({ title: link.title, url: link.url });
  const updateLink = useUpdateLink();

  const saveEdit = () => {
    updateLink.mutate(
      { id: link.id, data: form },
      {
        onSuccess: () => {
          onUpdate(form);
          setEditing(false);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card group">
      <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground shrink-0">
        <GripVertical className="w-4 h-4" />
      </div>

      {editing ? (
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-1.5 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Title"
          />
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            className="w-full px-3 py-1.5 rounded-lg border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="https://..."
          />
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{link.title}</p>
          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
        </div>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {editing ? (
          <>
            <button
              onClick={saveEdit}
              disabled={updateLink.isPending}
              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
            >
              {updateLink.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function EditLinksPage() {
  const { data: links, isLoading } = useGetLinks();
  const createLink = useCreateLink();
  const deleteLink = useDeleteLink();
  const reorderLinks = useReorderLinks();
  const queryClient = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [newForm, setNewForm] = useState<LinkForm>({ title: "", url: "" });
  const [localLinks, setLocalLinks] = useState<LinkItem[] | undefined>(undefined);

  const displayLinks: LinkItem[] = localLinks ?? (links as LinkItem[]) ?? [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createLink.mutate(
      { data: newForm },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() });
          setNewForm({ title: "", url: "" });
          setShowAdd(false);
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteLink.mutate(
      { id },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() }) }
    );
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(displayLinks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setLocalLinks(items);
    reorderLinks.mutate(
      { data: { ids: items.map((l) => l.id) } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() }) }
    );
  };

  const input = "w-full px-4 py-2.5 rounded-xl border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm";

  return (
    
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-display font-semibold">Links</h1>
          <p className="text-muted-foreground mt-1 text-sm">Drag to reorder. Your links appear on your public profile.</p>
        </motion.div>

        {/* Add link */}
        <AnimatePresence>
          {showAdd && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAdd}
              className="mb-4 p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-3 overflow-hidden"
            >
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))}
                className={input}
                placeholder="Link title (e.g. Twitter)"
                required
              />
              <input
                type="url"
                value={newForm.url}
                onChange={(e) => setNewForm((f) => ({ ...f, url: e.target.value }))}
                className={input}
                placeholder="https://..."
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createLink.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {createLink.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add link"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all mb-4"
          >
            <Plus className="w-4 h-4" />
            Add link
          </button>
        )}

        {/* Link list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : displayLinks.length === 0 ? (
          <div className="py-16 text-center">
            <Link2 className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No links yet. Add your first one above.</p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="links">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {displayLinks.map((link, index) => (
                    <Draggable key={link.id} draggableId={link.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <LinkRow
                            link={link}
                            dragHandleProps={provided.dragHandleProps}
                            onDelete={() => handleDelete(link.id)}
                            onUpdate={() => queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey() })}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    
  );
}
