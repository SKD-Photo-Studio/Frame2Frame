"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/modal";
import { api } from "@/lib/api";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ui/confirm-modal";
import EventIntakeForm from "./event-intake-form";

interface Props {
  event: {
    id: string;
    event_type: string;
    venue: string;
    city: string;
    package_value: number;
    dates?: string[];
  };
}

export default function EditEventButton({ event }: Props) {
  const [open, setOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await api.events.delete(event.id);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setOpen(false); // Close edit modal
      router.push("/events");
      router.refresh();
    } catch (err) {
      console.error("Failed to delete event:", err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 sm:w-auto"
      >
        Edit Event
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit Event" size="3xl">
        <div className="relative">
          <div className="absolute right-12 top-[-52px] z-50">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete Event
            </button>
          </div>
          
          <EventIntakeForm eventId={event.id} onSuccess={() => setOpen(false)} />
        </div>
      </Modal>

      <ConfirmModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Event?"
        message="Are you sure you want to delete this event permanently? All related expenses and client payments will also be deleted permanently."
      />
    </>
  );
}
