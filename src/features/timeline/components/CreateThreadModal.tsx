"use client";
import { ThreadComposerModal } from "@/src/features/thread/components/ThreadComposerModal";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, imageUrl: string | null) => Promise<void>;
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  return (
    <ThreadComposerModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="新規投稿"
      submitLabel="投稿する"
      placeholder="いまどうしてる？"
    />
  );
};
