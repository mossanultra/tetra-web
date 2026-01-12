"use client";
import { formatDate } from "./ThreadCard";
import { Thread } from "../types/Thread";
import { ThreadComposerModal } from "./ThreadComposerModal";

interface ReplyModalProps {
  isOpen: boolean;
  replyTarget: Thread | null;
  onClose: () => void;
  onSubmit: (text: string, imageUrl: string | null) => Promise<void>;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  replyTarget,
  onClose,
  onSubmit,
}) => {
  if (!replyTarget) return null;

  const headerContent = (
    <div className="p-4 border-b border-gray-200">
      <div className="flex gap-3">
        <img
          src={replyTarget.ownerUserProfile.imageUrl ?? "/default-user.png"}
          alt={replyTarget.ownerUserProfile.userName}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900">
              {replyTarget.ownerUserProfile.userName}
            </span>
            <span className="text-gray-500 text-sm">
              · {formatDate(replyTarget.createdAt)}
            </span>
          </div>
          <div className="text-gray-900 text-sm">{replyTarget.threadName}</div>
          {replyTarget.categoryContent.imageUrl && (
            <img
              src={replyTarget.categoryContent.imageUrl}
              alt="元の投稿画像"
              className="mt-2 rounded-xl max-h-40 object-cover"
            />
          )}
        </div>
      </div>
      <div className="ml-[52px] mt-2 text-sm text-gray-500">
        返信先:{" "}
        <span className="text-blue-500">
          @{replyTarget.ownerUserProfile.userName}
        </span>
      </div>
    </div>
  );

  return (
    <ThreadComposerModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title="返信"
      submitLabel="返信"
      placeholder="返信を入力"
      headerContent={headerContent}
    />
  );
};
