"use client";

import React from "react";
import ReactPaginate from "react-paginate";
import { useInbox } from "../hooks/useInbox";
import { InboxItem } from "./InboxItem";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export const InboxList: React.FC = () => {
  const {
    messages,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    isMarking,
    deleteMessage,
    pagination,
  } = useInbox();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        メッセージの取得に失敗しました。
      </div>
    );
  }

  if (messages.length === 0 && pagination.pageCount <= 1) {
    return (
      <div className="p-8 text-center text-gray-500">
        メッセージはありません。
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-10">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">受信トレイ</h1>
          <span className="text-sm text-gray-500">
            {pagination.pageCount > 0 &&
              `${pagination.currentPage + 1} / ${pagination.pageCount} ページ`}
          </span>
        </div>
        <button
          onClick={markAllAsRead}
          disabled={isMarking || messages.length === 0}
          className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 font-medium px-3 py-1.5 rounded-full hover:bg-blue-50 transition"
        >
          すべて既読にする
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          このページのメッセージはありません。
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {messages.map((message) => (
            <InboxItem
              key={message.messageId}
              message={message}
              onRead={markAsRead}
              onDelete={deleteMessage}
              isMarking={isMarking}
            />
          ))}
        </div>
      )}

      {pagination.pageCount > 1 && (
        <div className="flex justify-center py-8">
          <ReactPaginate
            previousLabel={<FaChevronLeft className="w-4 h-4" />}
            nextLabel={<FaChevronRight className="w-4 h-4" />}
            breakLabel={"..."}
            breakClassName={"px-3 py-2 text-gray-500"}
            pageCount={pagination.pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={({ selected }) => pagination.onPageChange(selected)}
            forcePage={pagination.currentPage}
            containerClassName={
              "flex items-center gap-1 bg-white p-2 rounded-lg shadow-sm border border-gray-100"
            }
            pageClassName={"rounded-md overflow-hidden"}
            pageLinkClassName={
              "block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            }
            activeClassName={"bg-blue-500 text-white hover:bg-blue-600"}
            activeLinkClassName={
              "!text-white hover:!bg-blue-600 hover:!text-white"
            }
            previousClassName={"rounded-md overflow-hidden mr-1"}
            previousLinkClassName={
              "block p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            }
            nextClassName={"rounded-md overflow-hidden ml-1"}
            nextLinkClassName={
              "block p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            }
            disabledClassName={"opacity-50 pointer-events-none"}
          />
        </div>
      )}
    </div>
  );
};
