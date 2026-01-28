import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface NotesSectionProps {
  applicationId: number;
}

export default function NotesSection({ applicationId }: NotesSectionProps) {
  const [noteText, setNoteText] = useState("");

  const { data: notes, isLoading, refetch } = trpc.applications.getNotes.useQuery(
    { applicationId },
    { enabled: !!applicationId }
  );

  const addNoteMutation = trpc.applications.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note added");
      setNoteText("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });

  const deleteNoteMutation = trpc.applications.deleteNote.useMutation({
    onSuccess: () => {
      toast.success("Note deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });

  const handleAddNote = () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }
    addNoteMutation.mutate({ applicationId, noteText: noteText.trim() });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Add Note Form */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Add Note
          </h3>
          <div className="space-y-3">
            <Textarea
              placeholder="Add a note about this application (e.g., follow-up sent, phone screen scheduled, feedback received)..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={handleAddNote}
              disabled={addNoteMutation.isPending || !noteText.trim()}
            >
              {addNoteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Note"
              )}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Activity & Notes</h3>
          {!notes || notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notes yet. Add your first note above to track activity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{note.noteText}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {note.createdAt
                          ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
                          : "Recently"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => note.id && deleteNoteMutation.mutate({ noteId: note.id })}
                      disabled={deleteNoteMutation.isPending}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
