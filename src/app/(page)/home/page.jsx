import React from 'react';

// カスタムフォントの読み込み
const fontStyle = `
  @font-face {
    font-family: 'Nyashi Friends';
    src: url('/nyashi_friends_tte/Nyashi_Friends.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`;

const ThreadCard = ({ thread, index }) => {
  // カードごとにランダムな角度（より大きく）
  const rotations = [-8, 5, -12, 7, -5, 10, -15, 3, -6, 12];
  const rotation = rotations[index % rotations.length];

  // ピンの色
  const pinColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-pink-500',
    'bg-purple-500'
  ];
  const pinColor = pinColors[index % pinColors.length];

  // ピンの位置（パーセントで指定）
  const pinLeftPositions = ['25%', '33%', '50%', '66%', '75%'];
  const pinLeft = pinLeftPositions[index % pinLeftPositions.length];

  // 日付のフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div
      className="relative hover:scale-110 hover:z-50 transition-all duration-300 cursor-pointer"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'top center'
      }}
    >
      {/* ピン */}
      <div
        className={`absolute -top-2 z-10`}
        style={{
          left: pinLeft,
          transform: 'translateX(-50%)'
        }}
      >
        <div className={`w-4 h-4 ${pinColor} rounded-full shadow-lg border-2 border-gray-700`}></div>
        <div className="w-1 h-3 bg-gray-600 mx-auto shadow"></div>
      </div>

      {/* カード本体 */}
      <div
        className="bg-yellow-50 p-4 shadow-xl border border-gray-300"
        style={{
          fontFamily: "'Nyashi Friends', cursive",
          boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)',
          minHeight: '180px',
          maxWidth: '240px'
        }}
      >
        {/* スレッドタイトル */}
        <h3 className="text-base font-bold mb-2 text-gray-800 break-words leading-tight">
          {thread.threadName}
        </h3>

        {/* 画像がある場合（小さめ） */}
        {thread.imageUrl && (
          <div className="mb-2">
            <img
              src={thread.imageUrl}
              alt={thread.threadName}
              className="w-full h-20 object-cover border-2 border-white shadow-sm"
            />
          </div>
        )}

        {/* ユーザー情報 */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src={thread.ownerUserProfile.imageUrl}
            alt={thread.ownerUserProfile.userName}
            className="w-6 h-6 rounded-full border border-gray-400 shadow"
          />
          <span className="text-xs text-gray-700 font-medium truncate">
            {thread.ownerUserProfile.userName}
          </span>
        </div>

        {/* 日付情報 */}
        <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-300">
          <div className="flex justify-between items-center">
            <span>{formatDate(thread.createdAt)}</span>
            {thread.selectDate && (
              <span className="bg-orange-200 px-2 py-0.5 rounded text-xs">
                📅 {formatDate(thread.selectDate)}
              </span>
            )}
          </div>
        </div>

        {/* 子スレッド数 */}
        {thread.childThreadCount > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
            {thread.childThreadCount}
          </div>
        )}
      </div>

      {/* 影（ピンで留められている感じ） */}
      <div
        className="absolute inset-0 bg-black opacity-5 -z-10"
        style={{
          transform: 'translate(2px, 3px)',
          filter: 'blur(3px)'
        }}
      ></div>
    </div>
  );
};

const SketchThreadList = () => {
  const threadsData = {
    threads: [
      {
        threadId: "530da551-2a37-4f9f-9283-a0319c65eb2a",
        threadName: "アドレス変更、パスワードリセット",
        createdAt: "2025-12-13T03:02:41.279Z",
        ownerUserId: "29aa36c3-675f-4db2-ba58-227165b49052",
        ownerUserProfile: {
          userId: "29aa36c3-675f-4db2-ba58-227165b49052",
          userName: "ボスじゃないわんこ",
          imageUrl: "https://tetra-images-poc.s3.amazonaws.com/profile/29aa36c3-675f-4db2-ba58-227165b49052.png"
        },
        parentThreadId: null,
        childThreadIds: [],
        mapPointInfoId: "530da551-2a37-4f9f-9283-a0319c65eb2a",
        imageUrl: null,
        selectDate: null,
        childThreadCount: 6
      },
      {
        threadId: "f8363e7f-dc7b-4c31-bba8-470e6a993a0f",
        threadName: "イルミ見に行くよ(*ﾟ∀ﾟ)",
        createdAt: "2025-12-09T22:50:30.394Z",
        ownerUserId: "6afa8165-89eb-4434-91e1-9cdac10ff57f",
        ownerUserProfile: {
          userId: "6afa8165-89eb-4434-91e1-9cdac10ff57f",
          userName: "しんちゃろ",
          imageUrl: "https://tetra-images-poc.s3.amazonaws.com/profile/6afa8165-89eb-4434-91e1-9cdac10ff57f.png"
        },
        parentThreadId: null,
        childThreadIds: [],
        mapPointInfoId: "e71f31af-6a5b-4d4f-aa38-f6e661d4e957",
        imageUrl: "https://tetra-images-stg.s3.amazonaws.com/thread/d0012bac-0eed-4bc2-9621-9c194b431c25.png",
        selectDate: "2025-12-21T00:00:00.000Z",
        childThreadCount: 0
      },
      {
        threadId: "a582d6f0-0456-48f8-9fe7-f86adfc032b6",
        threadName: "サンタさんくるってよ",
        createdAt: "2025-12-09T14:12:25.331Z",
        ownerUserId: "6afa8165-89eb-4434-91e1-9cdac10ff57f",
        ownerUserProfile: {
          userId: "6afa8165-89eb-4434-91e1-9cdac10ff57f",
          userName: "しんちゃろ",
          imageUrl: "https://tetra-images-poc.s3.amazonaws.com/profile/6afa8165-89eb-4434-91e1-9cdac10ff57f.png"
        },
        parentThreadId: null,
        childThreadIds: [],
        mapPointInfoId: "b176728b-742f-4676-8b97-3d395053f9d2",
        imageUrl: "https://tetra-images-stg.s3.amazonaws.com/thread/b6b9975c-70f4-4bb1-a151-229cea9d53e2.png",
        selectDate: "2025-12-21T00:00:00.000Z",
        childThreadCount: 1
      },
      {
        threadId: "cca7c24f-2558-4bb7-b558-8307a9d78986",
        threadName: "北斗市追分",
        createdAt: "2025-12-09T09:21:13.513Z",
        ownerUserId: "6afa8165-89eb-4434-91e1-9cdac10ff57f",
        ownerUserProfile: {
          userId: "6afa8165-89eb-4434-91e1-9cdac10ff57f",
          userName: "しんちゃろ",
          imageUrl: "https://tetra-images-poc.s3.amazonaws.com/profile/6afa8165-89eb-4434-91e1-9cdac10ff57f.png"
        },
        parentThreadId: null,
        childThreadIds: [],
        mapPointInfoId: "c860cd2e-4708-410d-a059-7ce9d3945311",
        imageUrl: null,
        selectDate: "2025-12-25T00:00:00.000Z",
        childThreadCount: 3
      },
      {
        threadId: "65cb8ac0-a98f-461b-83b1-7dcc97c30a8e",
        threadName: "ハッシュタグほしい",
        createdAt: "2025-12-13T01:00:25.560Z",
        ownerUserId: "29aa36c3-675f-4db2-ba58-227165b49052",
        ownerUserProfile: {
          userId: "29aa36c3-675f-4db2-ba58-227165b49052",
          userName: "ボスじゃないわんこ",
          imageUrl: "https://tetra-images-poc.s3.amazonaws.com/profile/29aa36c3-675f-4db2-ba58-227165b49052.png"
        },
        parentThreadId: null,
        childThreadIds: [],
        mapPointInfoId: "65cb8ac0-a98f-461b-83b1-7dcc97c30a8e",
        imageUrl: null,
        selectDate: null,
        childThreadCount: 0
      }
    ]
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundImage: 'url(/images/CorkBoard02.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* フォントのスタイルを挿入 */}
      <style>{fontStyle}</style>

      <div className="max-w-7xl mx-auto">
        <h1
          className="text-4xl font-bold text-amber-900 mb-8 text-center p-4 bg-amber-100 border-4 border-amber-800 shadow-lg inline-block"
          style={{
            fontFamily: "'Nyashi Friends', cursive",
            transform: 'rotate(-2deg)',
            marginLeft: '50%',
            transform: 'translateX(-50%) rotate(-2deg)'
          }}
        >
          📌 今月のイベント
        </h1>

        {/* ピンがランダムに刺さっている感じのグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-8">
          {threadsData.threads.map((thread, index) => (
            <ThreadCard key={thread.threadId} thread={thread} index={index} />
          ))}
        </div>
      </div>

      {/* コルクボードの質感を出すためのノイズ効果 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          mixBlendMode: 'multiply'
        }}
      ></div>
    </div>
  );
};

export default SketchThreadList;